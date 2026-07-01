import { prisma } from '@/lib/db';

export async function linkIntakeToUser(intakeId: string, userId: string) {
  const intake = await prisma.intakeSubmission.findUnique({
    where: { id: intakeId },
    include: { telemedRequest: true },
  });

  if (!intake) {
    throw new Error('INTAKE_NOT_FOUND');
  }

  await prisma.$transaction(async (tx) => {
    await tx.intakeSubmission.update({
      where: { id: intake.id },
      data: { userId },
    });

    if (intake.telemedRequest) {
      await tx.telemedRequest.update({
        where: { id: intake.telemedRequest.id },
        data: { userId },
      });
    }

    await tx.uploadedDocument.updateMany({
      where: { intakeId: intake.id },
      data: { userId },
    });

    await tx.pdfDocument.updateMany({
      where: { intakeId: intake.id },
      data: { userId },
    });

    await tx.consentRecord.updateMany({
      where: { intakeId: intake.id },
      data: { userId },
    });

    await tx.memberProfile.upsert({
      where: { userId },
      update: {
        displayName: intake.fullName,
        phone: intake.phone,
        lineUserId: intake.lineId,
        dateOfBirth: intake.dateOfBirth,
        profileStatus: 'verified',
      },
      create: {
        userId,
        displayName: intake.fullName,
        phone: intake.phone,
        lineUserId: intake.lineId,
        dateOfBirth: intake.dateOfBirth,
        profileStatus: 'verified',
      },
    });
  });
}

export async function linkPendingIntakesByEmail(userId: string, email: string) {
  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail) {
    return;
  }

  const intakes = await prisma.intakeSubmission.findMany({
    where: {
      userId: null,
      email: {
        equals: cleanEmail,
        mode: 'insensitive',
      },
    },
    orderBy: {
      submittedAt: 'desc',
    },
    select: {
      id: true,
    },
  });

  for (const intake of intakes) {
    await linkIntakeToUser(intake.id, userId);
  }
}

export function normalizeEmail(value: string) {
  const clean = value.trim().toLowerCase();

  if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return '';
  }

  return clean;
}
