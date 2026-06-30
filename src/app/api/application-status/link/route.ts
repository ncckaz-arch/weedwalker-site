import { NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const body = await request.json();
    const memberId = typeof body?.memberId === 'string' ? body.memberId.trim() : '';
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';

    if (!memberId || !phone) {
      return NextResponse.json({ error: 'Member ID and Phone Number are required.' }, { status: 400 });
    }

    const intake = await prisma.intakeSubmission.findUnique({
      where: { id: memberId },
      include: { telemedRequest: true }
    });

    if (!intake || normalizePhone(intake.phone) !== normalizePhone(phone)) {
      return NextResponse.json({ error: 'Member ID or Phone Number does not match.' }, { status: 404 });
    }

    if (intake.userId && intake.userId !== user.id) {
      return NextResponse.json({ error: 'This application is already linked to another Google account.' }, { status: 409 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.intakeSubmission.update({
        where: { id: intake.id },
        data: { userId: user.id }
      });

      if (intake.telemedRequest) {
        await tx.telemedRequest.update({
          where: { id: intake.telemedRequest.id },
          data: { userId: user.id }
        });
      }

      await tx.uploadedDocument.updateMany({
        where: { intakeId: intake.id },
        data: { userId: user.id }
      });

      await tx.pdfDocument.updateMany({
        where: { intakeId: intake.id },
        data: { userId: user.id }
      });

      await tx.memberProfile.upsert({
        where: { userId: user.id },
        update: {
          displayName: intake.fullName,
          phone: intake.phone,
          lineUserId: intake.lineId,
          dateOfBirth: intake.dateOfBirth,
          profileStatus: 'verified'
        },
        create: {
          userId: user.id,
          displayName: intake.fullName,
          phone: intake.phone,
          lineUserId: intake.lineId,
          dateOfBirth: intake.dateOfBirth,
          profileStatus: 'verified'
        }
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Google verification is required.' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to link application.' },
      { status: 400 }
    );
  }
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, '');
}
