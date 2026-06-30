import { randomUUID } from 'crypto';
import { IntakeStatus, PdfStatus, TelemedStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import { getAdminCustomerDetail } from '@/lib/admin-customers';
import { requireCurrentAdminUser } from '@/lib/admin';
import { prisma } from '@/lib/db';
import { ensureIntakePdfWorkflow } from '@/lib/pdf-workflow';
import { saveGeneratedPdf } from '@/lib/storage';
import { emptyToNull } from '@/lib/validators';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    await requireCurrentAdminUser();

    const form = await request.formData();
    const action = String(form.get('action') ?? '');
    const returnTo = safeReturnTo(request, form.get('returnTo'), params.id);
    const customer = await getAdminCustomerDetail(params.id);

    if (!customer) {
      return NextResponse.json({ error: 'CUSTOMER_NOT_FOUND' }, { status: 404 });
    }

    const intakeId = customer.latestIntakeSubmission?.id;
    const telemedId = customer.telemedRequests[0]?.id;
    const userId = customer.user?.id ?? null;

    if (action === 'approve-intake' && intakeId) {
      await prisma.intakeSubmission.update({
        where: {
          id: intakeId,
        },
        data: {
          status: IntakeStatus.COMPLETED,
        },
      });
    }

    if (action === 'approve-telemed' && telemedId) {
      await prisma.telemedRequest.update({
        where: {
          id: telemedId,
        },
        data: {
          status: TelemedStatus.SCHEDULED,
          approvedAt: new Date(),
        },
      });
    }

    if (action === 'add-meeting-link' && intakeId) {
      const meetingLink = normalizeMeetingLink(String(form.get('meetingLink') ?? ''));
      const adminNotes = emptyToNull(String(form.get('adminNotes') ?? ''));
      const preferredDate = parseOptionalDate(String(form.get('meetingDate') ?? ''));

      if (!meetingLink) {
        return NextResponse.json({ error: 'MEETING_LINK_REQUIRED' }, { status: 400 });
      }

      if (telemedId) {
        await prisma.telemedRequest.update({
          where: {
            id: telemedId,
          },
          data: {
            meetingLink,
            adminNotes,
            preferredDate,
            status: TelemedStatus.SCHEDULED,
            approvedAt: new Date(),
          },
        });
      } else {
        await prisma.telemedRequest.create({
          data: {
            userId,
            intakeId,
            meetingLink,
            adminNotes,
            preferredDate,
            status: TelemedStatus.SCHEDULED,
            approvedAt: new Date(),
          },
        });
      }
    }

    if (action === 'mark-consultation-completed') {
      if (telemedId) {
        await prisma.telemedRequest.update({
          where: {
            id: telemedId,
          },
          data: {
            status: TelemedStatus.COMPLETED,
            completedAt: new Date(),
          },
        });
      }

      if (intakeId) {
        await prisma.intakeSubmission.update({
          where: {
            id: intakeId,
          },
          data: {
            status: IntakeStatus.COMPLETED,
          },
        });
      }
    }

    if ((action === 'generate-pt33' || action === 'generate-medical-certificate-draft') && intakeId) {
      await ensureIntakePdfWorkflow({
        intakeId,
      });
    }

    if (action === 'upload-final-certificate' && intakeId) {
      const file = form.get('finalCertificate');

      if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json({ error: 'FINAL_CERTIFICATE_REQUIRED' }, { status: 400 });
      }

      if (file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'FINAL_CERTIFICATE_MUST_BE_PDF' }, { status: 400 });
      }

      const pdfBytes = Buffer.from(await file.arrayBuffer());
      const saved = await saveGeneratedPdf({
        ownerKey: userId ?? intakeId,
        documentType: 'MEDICAL_CERTIFICATE_FINAL',
        pdfBytes,
      });
      const existingFinal = await prisma.pdfDocument.findFirst({
        where: {
          intakeId,
          documentType: 'MEDICAL_CERTIFICATE_FINAL',
        },
      });
      const documentData = {
        userId,
        intakeId,
        telemedRequestId: telemedId ?? null,
        title: 'Medical Certificate Final',
        documentType: 'MEDICAL_CERTIFICATE_FINAL',
        storageKey: saved.storageKey,
        contentBytes: saved.contentBytes ?? null,
        accessToken: existingFinal?.accessToken ?? randomUUID(),
        status: PdfStatus.AVAILABLE,
      };

      if (existingFinal) {
        await prisma.pdfDocument.update({
          where: {
            id: existingFinal.id,
          },
          data: documentData,
        });
      } else {
        await prisma.pdfDocument.create({
          data: documentData,
        });
      }
    }

    revalidatePath('/admin/members');
    return NextResponse.redirect(returnTo, { status: 303 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

    if (message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
    }

    if (message === 'ADMIN_REQUIRED') {
      return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 });
    }

    console.error('[admin-customers] action failed', error);
    return NextResponse.json({ error: 'CUSTOMER_ACTION_FAILED' }, { status: 500 });
  }
}

function safeReturnTo(request: Request, value: FormDataEntryValue | null, customerId: string) {
  const fallback = new URL(`/admin/members?customer=${encodeURIComponent(customerId)}`, request.url);
  const raw = typeof value === 'string' ? value : '';

  if (!raw.startsWith('/admin/members')) {
    return fallback;
  }

  return new URL(raw, request.url);
}

function normalizeMeetingLink(value: string) {
  const clean = emptyToNull(value);

  if (!clean) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;

  try {
    return new URL(withProtocol).toString();
  } catch {
    return null;
  }
}

function parseOptionalDate(value: string) {
  const clean = emptyToNull(value);

  if (!clean) {
    return null;
  }

  const date = new Date(clean);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}
