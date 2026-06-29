import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ linked: false, user: null });
  }

  const intake = await prisma.intakeSubmission.findFirst({
    where: { userId: user.id },
    orderBy: { submittedAt: 'desc' },
    include: {
      telemedRequest: true
    }
  });

  if (!intake) {
    return NextResponse.json({
      linked: false,
      user: {
        email: user.email,
        name: user.name
      }
    });
  }

  const documents = await prisma.pdfDocument.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({
    linked: true,
    user: {
      email: user.email,
      name: user.name
    },
    member: {
      memberId: intake.id,
      name: intake.fullName,
      phone: intake.phone,
      email: intake.email,
      verified: true
    },
    registration: registrationStatus(intake.status),
    telemed: telemedStatus(intake.telemedRequest?.status || null),
    appointment: {
      meetingDateTime: intake.telemedRequest?.preferredDate
        ? intake.telemedRequest.preferredDate.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
        : null,
      joinUrl: null
    },
    documents: {
      pt33: documentStatus(documents, 'PT33', Boolean(intake.telemedRequest?.status === 'COMPLETED')),
      prescription: documentStatus(documents, 'PRESCRIPTION', Boolean(intake.telemedRequest?.status === 'COMPLETED'))
    }
  });
}

function registrationStatus(status: string) {
  return {
    submitted: true,
    underReview: status === 'UNDER_REVIEW' || status === 'COMPLETED' || status === 'CANCELLED',
    approved: status === 'COMPLETED',
    rejected: status === 'CANCELLED',
    label:
      status === 'COMPLETED'
        ? 'Approved'
        : status === 'CANCELLED'
          ? 'Rejected'
          : status === 'UNDER_REVIEW'
            ? 'Under Review'
            : 'Registration Submitted'
  };
}

function telemedStatus(status: string | null) {
  return {
    pending: !status || status === 'REQUESTED' || status === 'REVIEWING',
    approved: status === 'SCHEDULED',
    completed: status === 'COMPLETED',
    label:
      status === 'COMPLETED'
        ? 'Completed'
        : status === 'SCHEDULED'
          ? 'Approved'
          : 'Pending'
  };
}

function documentStatus(
  documents: Array<{ id: string; title: string; documentType: string; status: string }>,
  documentType: 'PT33' | 'PRESCRIPTION',
  telemedCompleted: boolean
) {
  const document = documents.find((item) => item.documentType.toUpperCase() === documentType);
  const label = documentType === 'PT33' ? 'Download PT33' : 'Download Prescription';

  if (document?.status === 'AVAILABLE') {
    return {
      label,
      state: 'available',
      url: `/api/application-status/documents/${document.id}/download`
    };
  }

  if (document) {
    return { label, state: 'processing', url: null };
  }

  return {
    label,
    state: telemedCompleted ? 'processing' : 'not_available',
    url: null
  };
}
