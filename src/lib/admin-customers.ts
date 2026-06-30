import type {
  ConsentRecord,
  IntakeSubmission,
  MemberProfile,
  PdfDocument,
  TelemedRequest,
  UploadedDocument,
  User,
} from '@prisma/client';

import { prisma } from '@/lib/db';
import { formatPublicMemberId } from '@/lib/member-id';

export type AdminGeneratedDocument = Omit<PdfDocument, 'contentBytes'> & {
  hasFile: boolean;
};

export type AdminCustomerSummary = {
  id: string;
  memberId: string;
  name: string;
  phone: string;
  email: string;
  latestIntakeStatus: string;
  telemedStatus: string;
  consentStatus: string;
  updatedAt: Date | null;
};

export type AdminCustomerDetail = {
  memberProfile: MemberProfile | null;
  user: User | null;
  latestIntakeSubmission: IntakeSubmission | null;
  consentRecords: ConsentRecord[];
  telemedRequests: TelemedRequest[];
  uploadedDocuments: UploadedDocument[];
  generatedDocuments: AdminGeneratedDocument[];
};

const THAI_EMPTY = 'ยังไม่มีข้อมูล';
const THAI_PENDING_REVIEW = 'รอแอดมินตรวจสอบ';

const intakeDetailInclude = {
  user: {
    include: {
      memberProfile: true,
    },
  },
  consentRecords: {
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
  telemedRequest: {
    include: {
      pdfDocuments: {
        orderBy: {
          createdAt: 'desc' as const,
        },
      },
    },
  },
  uploadedDocuments: {
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
  pdfDocuments: {
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
};

const userDetailInclude = {
  memberProfile: true,
  intakeSubmissions: {
    orderBy: {
      submittedAt: 'desc' as const,
    },
    take: 1,
    select: {
      id: true,
    },
  },
  consentRecords: {
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
  telemedRequests: {
    orderBy: {
      requestedAt: 'desc' as const,
    },
    include: {
      pdfDocuments: {
        orderBy: {
          createdAt: 'desc' as const,
        },
      },
    },
  },
  uploadedDocuments: {
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
  pdfDocuments: {
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
};

type IntakeDetail = Awaited<ReturnType<typeof findIntakeDetail>>;
type UserDetail = Awaited<ReturnType<typeof findUserDetail>>;

export async function getAdminCustomerRows(search = ''): Promise<AdminCustomerSummary[]> {
  const [intakes, usersWithoutIntake] = await Promise.all([
    prisma.intakeSubmission.findMany({
      orderBy: {
        submittedAt: 'desc',
      },
      take: 150,
      include: {
        user: {
          include: {
            memberProfile: true,
          },
        },
        telemedRequest: true,
        consentRecords: true,
      },
    }),
    prisma.user.findMany({
      where: {
        intakeSubmissions: {
          none: {},
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 100,
      include: {
        memberProfile: true,
      },
    }),
  ]);

  const seen = new Set<string>();
  const rows: AdminCustomerSummary[] = [];

  for (const intake of intakes) {
    const rowKey = intake.userId ?? `${intake.email}:${intake.phone}`;

    if (seen.has(rowKey)) {
      continue;
    }

    seen.add(rowKey);
    rows.push(summaryFromIntake(intake));
  }

  for (const user of usersWithoutIntake) {
    rows.push(summaryFromUser(user));
  }

  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return rows;
  }

  return rows.filter((row) =>
    [
      row.id,
      row.memberId,
      row.name,
      row.phone,
      row.email,
      row.latestIntakeStatus,
      row.telemedStatus,
      row.consentStatus,
    ]
      .join(' ')
      .toLowerCase()
      .includes(normalizedSearch),
  );
}

export async function getAdminCustomerDetail(id: string): Promise<AdminCustomerDetail | null> {
  const intake = await findIntakeDetail(id);

  if (intake) {
    return detailFromIntake(intake);
  }

  const user = await findUserDetail(id);

  if (user) {
    return await detailFromUser(user);
  }

  const memberProfile = await prisma.memberProfile.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        include: userDetailInclude,
      },
    },
  });

  if (memberProfile?.user) {
    return await detailFromUser(memberProfile.user);
  }

  return null;
}

export function serializeAdminCustomerDetail(detail: AdminCustomerDetail) {
  return JSON.parse(JSON.stringify(detail)) as AdminCustomerDetail;
}

export function formatAdminMemberId(id?: string | null) {
  if (!id) {
    return THAI_EMPTY;
  }

  return formatPublicMemberId(id);
}

async function findIntakeDetail(id: string) {
  return prisma.intakeSubmission.findUnique({
    where: {
      id,
    },
    include: intakeDetailInclude,
  });
}

async function findUserDetail(id: string) {
  return prisma.user.findUnique({
    where: {
      id,
    },
    include: userDetailInclude,
  });
}

function summaryFromIntake(
  intake: IntakeSubmission & {
    user: (User & { memberProfile: MemberProfile | null }) | null;
    telemedRequest: TelemedRequest | null;
    consentRecords: ConsentRecord[];
  },
): AdminCustomerSummary {
  const profile = intake.user?.memberProfile ?? null;
  const name = profile?.displayName ?? intake.user?.name ?? intake.fullName ?? THAI_EMPTY;
  const phone = profile?.phone ?? intake.phone ?? THAI_EMPTY;
  const email = intake.user?.email ?? intake.email ?? THAI_EMPTY;

  return {
    id: intake.id,
    memberId: formatAdminMemberId(intake.id),
    name,
    phone,
    email,
    latestIntakeStatus: intake.status ?? THAI_EMPTY,
    telemedStatus: intake.telemedRequest?.status ?? (intake.requestTelemed ? THAI_PENDING_REVIEW : THAI_EMPTY),
    consentStatus: consentStatus(intake.consentRecords),
    updatedAt: maxDate(intake.updatedAt, intake.submittedAt, intake.telemedRequest?.updatedAt),
  };
}

function summaryFromUser(user: User & { memberProfile: MemberProfile | null }): AdminCustomerSummary {
  return {
    id: user.memberProfile?.id ?? user.id,
    memberId: formatAdminMemberId(user.memberProfile?.id ?? user.id),
    name: user.memberProfile?.displayName ?? user.name ?? THAI_EMPTY,
    phone: user.memberProfile?.phone ?? THAI_EMPTY,
    email: user.email,
    latestIntakeStatus: THAI_EMPTY,
    telemedStatus: THAI_EMPTY,
    consentStatus: THAI_EMPTY,
    updatedAt: maxDate(user.memberProfile?.updatedAt, user.updatedAt),
  };
}

function detailFromIntake(intake: NonNullable<IntakeDetail>): AdminCustomerDetail {
  const { user, consentRecords, telemedRequest, uploadedDocuments, pdfDocuments, ...latestIntakeSubmission } =
    intake;
  const telemedRequests = telemedRequest ? [plainTelemedRequest(telemedRequest)] : [];
  const telemedDocuments = telemedRequest?.pdfDocuments ?? [];
  const generatedDocuments = uniqueDocuments([...pdfDocuments, ...telemedDocuments]).map(mapPdfDocument);

  return {
    memberProfile: user?.memberProfile ?? null,
    user: plainUser(user),
    latestIntakeSubmission,
    consentRecords,
    telemedRequests,
    uploadedDocuments,
    generatedDocuments,
  };
}

async function detailFromUser(user: NonNullable<UserDetail>): Promise<AdminCustomerDetail> {
  if (user.intakeSubmissions[0]?.id) {
    return await getDetailFromLatestUserIntake(user);
  }

  const {
    memberProfile,
    intakeSubmissions: _intakeSubmissions,
    consentRecords,
    telemedRequests,
    uploadedDocuments,
    pdfDocuments,
    ...plain
  } = user;

  return {
    memberProfile,
    user: plain,
    latestIntakeSubmission: null,
    consentRecords,
    telemedRequests: telemedRequests.map(plainTelemedRequest),
    uploadedDocuments,
    generatedDocuments: uniqueDocuments([
      ...pdfDocuments,
      ...telemedRequests.flatMap((request) => request.pdfDocuments),
    ]).map(mapPdfDocument),
  };
}

async function getDetailFromLatestUserIntake(user: NonNullable<UserDetail>) {
  const latestIntake = await findIntakeDetail(user.intakeSubmissions[0].id);

  if (latestIntake) {
    return detailFromIntake(latestIntake);
  }

  const {
    memberProfile,
    intakeSubmissions: _intakeSubmissions,
    consentRecords,
    telemedRequests,
    uploadedDocuments,
    pdfDocuments,
    ...plain
  } = user;

  return {
    memberProfile,
    user: plain,
    latestIntakeSubmission: null,
    consentRecords,
    telemedRequests: telemedRequests.map(plainTelemedRequest),
    uploadedDocuments,
    generatedDocuments: uniqueDocuments([
      ...pdfDocuments,
      ...telemedRequests.flatMap((request) => request.pdfDocuments),
    ]).map(mapPdfDocument),
  };
}

function plainUser(user: (User & { memberProfile?: MemberProfile | null }) | null): User | null {
  if (!user) {
    return null;
  }

  const { memberProfile: _memberProfile, ...plain } = user;
  return plain;
}

function plainTelemedRequest(
  request: TelemedRequest & { pdfDocuments?: PdfDocument[] },
): TelemedRequest {
  const { pdfDocuments: _pdfDocuments, ...plain } = request;
  return plain;
}

function mapPdfDocument(document: PdfDocument): AdminGeneratedDocument {
  const { contentBytes, ...plain } = document;

  return {
    ...plain,
    hasFile: Boolean(document.storageKey || contentBytes),
  };
}

function uniqueDocuments(documents: PdfDocument[]) {
  const seen = new Set<string>();

  return documents.filter((document) => {
    if (seen.has(document.id)) {
      return false;
    }

    seen.add(document.id);
    return true;
  });
}

function consentStatus(records: ConsentRecord[]) {
  const record = combinedConsentRecord(records);

  if (!record) {
    return THAI_EMPTY;
  }

  return record.accepted ? 'Accepted' : 'Pending';
}

function combinedConsentRecord(records: ConsentRecord[]) {
  if (records.length === 0) {
    return null;
  }

  const acceptedRecords = records.filter((record) => record.accepted);
  const candidates = acceptedRecords.length > 0 ? acceptedRecords : records;

  return candidates.reduce((latest, record) => (record.createdAt > latest.createdAt ? record : latest));
}

function maxDate(...dates: Array<Date | null | undefined>) {
  const validDates = dates.filter((date): date is Date => Boolean(date));

  if (validDates.length === 0) {
    return null;
  }

  return validDates.reduce((latest, date) => (date > latest ? date : latest), validDates[0]);
}
