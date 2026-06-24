import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { ConsentType, UploadKind } from '@prisma/client';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { emptyToNull, intakeSchema, optionalDate } from '@/lib/validators';
import { fileUploadsEnabled, saveUpload } from '@/lib/storage';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const formData = await request.formData();
    const fields = Object.fromEntries(formData.entries());
    const parsed = intakeSchema.parse(fields);
    const uploadsEnabled = fileUploadsEnabled();

    const idCard = formData.get('idCard');
    const selfie = formData.get('selfie');
    const medicalDocs = formData.getAll('medicalDocuments').filter((item): item is File => item instanceof File && item.size > 0);

    if (uploadsEnabled && (!(idCard instanceof File) || idCard.size === 0)) {
      return NextResponse.json({ error: 'ID card image is required.' }, { status: 400 });
    }

    if (uploadsEnabled && (!(selfie instanceof File) || selfie.size === 0)) {
      return NextResponse.json({ error: 'Selfie image is required.' }, { status: 400 });
    }

    const requestHeaders = headers();
    const ipAddress = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
    const userAgent = requestHeaders.get('user-agent') || null;

    const uploadedFiles = uploadsEnabled
      ? [
          { kind: UploadKind.ID_CARD, file: idCard as File },
          { kind: UploadKind.SELFIE, file: selfie as File },
          ...medicalDocs.map((file) => ({ kind: UploadKind.MEDICAL_DOCUMENT, file }))
        ]
      : [];
    const ownerKey = user?.id || `guest-${Date.now()}-${randomUUID()}`;

    const savedFiles = await Promise.all(
      uploadedFiles.map(async (upload) => ({
        ...upload,
        saved: await saveUpload({
          ownerKey,
          kind: upload.kind,
          file: upload.file
        })
      }))
    );

    const result = await prisma.$transaction(async (tx) => {
      const intake = await tx.intakeSubmission.create({
        data: {
          userId: user?.id || null,
          fullName: parsed.fullName,
          email: parsed.email,
          phone: parsed.phone,
          lineId: emptyToNull(parsed.lineId),
          dateOfBirth: optionalDate(parsed.dateOfBirth),
          nationalIdLast4: emptyToNull(parsed.nationalIdLast4),
          currentSymptoms: emptyToNull(parsed.currentSymptoms),
          intendedUse: emptyToNull(parsed.intendedUse),
          allergies: emptyToNull(parsed.allergies),
          medications: emptyToNull(parsed.medications),
          priorCannabisExperience: emptyToNull(parsed.priorCannabisExperience),
          requestTelemed: Boolean(parsed.requestTelemed)
        }
      });

      if (savedFiles.length > 0) {
        await tx.uploadedDocument.createMany({
          data: savedFiles.map(({ kind, file, saved }) => ({
            userId: user?.id || null,
            intakeId: intake.id,
            kind,
            originalName: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
            storageKey: saved.storageKey,
            checksumSha256: saved.checksumSha256
          }))
        });
      }

      await tx.consentRecord.createMany({
        data: [
          ConsentType.PDPA,
          ConsentType.MEDICAL_INTAKE,
          ConsentType.DOCUMENT_STORAGE,
          ...(parsed.requestTelemed ? [ConsentType.TELEMED_REQUEST] : [])
        ].map((consentType) => ({
          userId: user?.id || null,
          intakeId: intake.id,
          consentType,
          consentVersion: '2026-06-24',
          accepted: true,
          ipAddress,
          userAgent
        }))
      });

      const telemedRequest = parsed.requestTelemed
        ? await tx.telemedRequest.create({
            data: {
              userId: user?.id || null,
              intakeId: intake.id,
              preferredDate: optionalDate(parsed.preferredTelemedDate),
              note: emptyToNull(parsed.telemedNote)
            }
          })
        : null;

      if (user) {
        await tx.memberProfile.upsert({
          where: { userId: user.id },
          update: {
            displayName: parsed.fullName,
            phone: parsed.phone,
            lineUserId: emptyToNull(parsed.lineId),
            dateOfBirth: optionalDate(parsed.dateOfBirth),
            profileStatus: 'active'
          },
          create: {
            userId: user.id,
            displayName: parsed.fullName,
            phone: parsed.phone,
            lineUserId: emptyToNull(parsed.lineId),
            dateOfBirth: optionalDate(parsed.dateOfBirth),
            profileStatus: 'active'
          }
        });
      }

      return { intake, telemedRequest };
    });

    return NextResponse.json({
      ok: true,
      intakeId: result.intake.id,
      telemedRequestId: result.telemedRequest?.id || null
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Intake submission failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
