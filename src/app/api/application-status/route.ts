import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { formatPublicMemberId } from '@/lib/member-id';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ linked: false, user: null });
  }

  const intake = await prisma.intakeSubmission.findFirst({
    where: { userId: user.id },
    orderBy: { submittedAt: 'desc' },
    include: {
      telemedRequest: true,
      uploadedDocuments: {
        where: {
          kind: {
            not: 'SELFIE'
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
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
    where: {
      OR: [
        { userId: user.id },
        { intakeId: intake.id }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });
  const timeline = timelineStatus(intake.status, intake.telemedRequest?.status || null, documents);
  const current = currentStatus(intake.status, intake.telemedRequest?.status || null, documents);

  return NextResponse.json({
    linked: true,
    user: {
      email: user.email,
      name: user.name
    },
    member: {
      memberId: formatPublicMemberId(intake.id),
      name: intake.fullName,
      phone: intake.phone,
      email: intake.email,
      verified: true
    },
    current,
    timeline,
    registration: registrationStatus(intake.status),
    telemed: telemedStatus(intake.telemedRequest?.status || null),
    appointment: {
      meetingDateTime: intake.telemedRequest?.preferredDate
        ? intake.telemedRequest.preferredDate.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
        : null,
      joinUrl: null
    },
    latestUpload: latestUpload(intake.uploadedDocuments[0]),
    documents: {
      signedConsent: documentStatus(documents, 'SIGNED_CONSENT', 'Signed Consent Form'),
      pt33: documentStatus(documents, 'PT33', 'Download PT33', Boolean(intake.telemedRequest?.status === 'COMPLETED')),
      prescription: documentStatus(documents, 'PRESCRIPTION', 'Download Prescription', Boolean(intake.telemedRequest?.status === 'COMPLETED')),
      certificate: documentStatus(documents, 'MEDICAL_CERTIFICATE_FINAL', 'Download Certificate', Boolean(intake.telemedRequest?.status === 'COMPLETED')),
      certificateDraft: documentStatus(documents, 'MEDICAL_CERTIFICATE_DRAFT', 'Medical Certificate Draft')
    },
    notifications: notifications(intake, documents)
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
  documents: Array<{ id: string; title: string; documentType: string; status: string; createdAt: Date }>,
  documentType: string,
  label: string,
  telemedCompleted = false
) {
  const document = documents.find((item) => item.documentType.toUpperCase() === documentType);

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

function timelineStatus(
  intakeStatus: string,
  telemedStatusValue: string | null,
  documents: Array<{ documentType: string; status: string }>
) {
  const documentApproved = documents.some((document) =>
    ['PT33', 'PRESCRIPTION', 'MEDICAL_CERTIFICATE_FINAL'].includes(document.documentType.toUpperCase()) &&
    document.status === 'AVAILABLE'
  );

  return [
    { key: 'submitted', label: 'Application Submitted', state: 'done' },
    {
      key: 'review',
      label: 'Under Review',
      state: intakeStatus === 'SUBMITTED' || intakeStatus === 'UNDER_REVIEW' ? 'active' : 'done'
    },
    {
      key: 'documents',
      label: 'Documents Approved',
      state: documentApproved ? 'done' : 'pending'
    },
    {
      key: 'telemed',
      label: 'Telemedicine Scheduled',
      state:
        telemedStatusValue === 'COMPLETED'
          ? 'done'
          : telemedStatusValue === 'SCHEDULED'
            ? 'active'
            : 'pending'
    },
    {
      key: 'completed',
      label: 'Completed',
      state: telemedStatusValue === 'COMPLETED' || intakeStatus === 'COMPLETED' ? 'done' : 'pending'
    }
  ];
}

function currentStatus(
  intakeStatus: string,
  telemedStatusValue: string | null,
  documents: Array<{ documentType: string; status: string }>
) {
  const hasFinalDocument = documents.some((document) =>
    ['PT33', 'PRESCRIPTION', 'MEDICAL_CERTIFICATE_FINAL'].includes(document.documentType.toUpperCase()) &&
    document.status === 'AVAILABLE'
  );

  if (telemedStatusValue === 'COMPLETED') {
    return {
      label: 'Completed',
      description: 'Your partner clinic process is completed. Available documents can be downloaded below.'
    };
  }

  if (telemedStatusValue === 'SCHEDULED') {
    return {
      label: 'Telemedicine Scheduled',
      description: 'Your partner clinic appointment has been scheduled. Please check the appointment card.'
    };
  }

  if (hasFinalDocument || intakeStatus === 'COMPLETED') {
    return {
      label: 'Approved',
      description: 'Your documents have been approved. Available PDFs can be downloaded in the Documents section.'
    };
  }

  if (intakeStatus === 'CANCELLED') {
    return {
      label: 'Rejected',
      description: 'Your application could not be continued. Please contact support for more information.'
    };
  }

  return {
    label: 'Under Review',
    description: 'Your application is currently being reviewed. Typical review time is 1–2 business days.'
  };
}

function latestUpload(upload?: { kind: string; originalName: string; createdAt: Date } | null) {
  if (!upload) return null;

  return {
    title:
      upload.kind === 'ID_CARD'
        ? 'Thai ID Card / Passport'
        : 'Uploaded Medical Document',
    originalName: upload.originalName,
    status: 'Uploaded',
    uploadedAt: upload.createdAt.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
  };
}

function notifications(
  intake: { submittedAt: Date; status: string; telemedRequest?: { status: string; preferredDate: Date | null } | null },
  documents: Array<{ documentType: string; status: string; createdAt: Date }>
) {
  const items = [
    {
      id: 'submitted',
      title: 'Application Submitted',
      body: 'Your intake has been received successfully.',
      date: intake.submittedAt.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
      unread: false
    }
  ];

  if (intake.status === 'UNDER_REVIEW' || intake.status === 'SUBMITTED') {
    items.unshift({
      id: 'review',
      title: 'Under Review',
      body: 'Your application is currently being reviewed.',
      date: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
      unread: true
    });
  }

  if (intake.telemedRequest?.status === 'SCHEDULED') {
    items.unshift({
      id: 'telemed-scheduled',
      title: 'Telemedicine Scheduled',
      body: 'Your partner clinic appointment has been scheduled.',
      date: intake.telemedRequest.preferredDate?.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) || '',
      unread: true
    });
  }

  for (const document of documents.filter((item) => item.status === 'AVAILABLE')) {
    if (document.documentType === 'PT33') {
      items.unshift({
        id: document.documentType,
        title: 'PT33 Approved',
        body: 'Your PT33 document is ready to download.',
        date: document.createdAt.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
        unread: true
      });
    }

    if (document.documentType === 'PRESCRIPTION') {
      items.unshift({
        id: document.documentType,
        title: 'Prescription Ready',
        body: 'Your prescription document is ready to download.',
        date: document.createdAt.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
        unread: true
      });
    }

    if (document.documentType === 'MEDICAL_CERTIFICATE_FINAL') {
      items.unshift({
        id: document.documentType,
        title: 'Certificate Ready',
        body: 'Your medical certificate is ready to download.',
        date: document.createdAt.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
        unread: true
      });
    }
  }

  return items.slice(0, 6);
}
