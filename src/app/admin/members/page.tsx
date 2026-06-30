import type { ConsentRecord, TelemedRequest, UploadedDocument } from '@prisma/client';
import Link from 'next/link';

import { CopyMemberPortalLink } from '@/components/admin/copy-member-portal-link';
import { GoogleSignIn } from '@/components/google-sign-in';
import {
  formatAdminMemberId,
  getAdminCustomerDetail,
  getAdminCustomerRows,
  type AdminCustomerDetail,
  type AdminCustomerSummary,
  type AdminGeneratedDocument,
} from '@/lib/admin-customers';
import { getCurrentAdminUser } from '@/lib/admin';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Members | WEED WALKER',
  description: 'WEED WALKER customer detail view for admin operations.',
};

const EMPTY_TEXT = 'ยังไม่มีข้อมูล';
const NOT_UPLOADED = 'ยังไม่ได้อัปโหลด';
const NOT_GENERATED = 'ยังไม่ได้สร้างเอกสาร';
const NO_FILE = 'ยังไม่มีไฟล์';
const PENDING_REVIEW = 'รอแอดมินตรวจสอบ';

type AdminMembersPageProps = {
  searchParams?: {
    q?: string;
    customer?: string;
  };
};

type ActivityItem = {
  label: string;
  detail: string;
  date: Date | string | null;
};

const COMBINED_CONSENT_COPY = 'ผู้สมัครยืนยัน checkbox เดียวบนหน้า Medical Intake';
const COMBINED_CONSENT_ACCEPTED = 'ยอมรับความยินยอมรวมแล้ว';

export default async function AdminMembersPage({ searchParams }: AdminMembersPageProps) {
  const currentUser = await getCurrentUser();
  const adminUser = await getCurrentAdminUser();
  const query = searchParams?.q?.trim() ?? '';

  if (!currentUser) {
    return (
      <main className="walker-shell py-10">
        <section className="walker-card mx-auto grid max-w-2xl gap-5 p-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-walkerYellow">Admin Members</p>
          <h1 className="text-4xl font-black tracking-[-0.05em] md:text-6xl">Continue with Google</h1>
          <p className="text-sm leading-7 text-walkerMuted">เข้าสู่ระบบด้วย Google account ที่ได้รับสิทธิ์ admin</p>
          <GoogleSignIn />
        </section>
      </main>
    );
  }

  if (!adminUser) {
    return (
      <main className="walker-shell py-10">
        <section className="walker-card p-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-walkerYellow">Admin Members</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.05em]">Access Not Configured</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-walkerMuted">
            บัญชี {currentUser.email} ยังไม่มีสิทธิ์ admin หรือยังไม่ได้ตั้งค่า ADMIN_EMAILS / ADMIN_EMAIL ใน Vercel
          </p>
        </section>
      </main>
    );
  }

  const rows = await getAdminCustomerRows(query);
  const selectedId = searchParams?.customer ?? rows[0]?.id ?? null;
  const selectedCustomer = selectedId ? await getAdminCustomerDetail(selectedId) : null;
  const returnTo = createReturnTo(query, selectedId);

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-5 text-[#f7f3df] sm:px-5 lg:px-6">
      <section className="mx-auto grid w-full max-w-[1560px] gap-5">
        <AdminHeader query={query} />

        <div className="grid gap-5 xl:grid-cols-[440px_minmax(0,1fr)]">
          <MemberList rows={rows} query={query} selectedId={selectedId} />
          {selectedCustomer ? (
            <CustomerDetail customer={selectedCustomer} selectedId={selectedId} returnTo={returnTo} />
          ) : (
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <h2 className="text-2xl font-black">ยังไม่มีข้อมูล</h2>
              <p className="mt-3 text-sm leading-7 text-walkerMuted">ยังไม่พบสมาชิกหรือรายการ intake ที่ตรงกับคำค้นหา</p>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

function AdminHeader({ query }: { query: string }) {
  return (
    <header className="rounded-2xl border border-white/10 bg-black/55 p-4 shadow-[0_0_60px_rgba(0,0,0,0.35)] backdrop-blur md:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <Link href="/admin" className="text-xs font-black uppercase tracking-[0.2em] text-walkerYellow">
            WEED WALKER Admin
          </Link>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em] md:text-5xl">Members</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-walkerMuted">
            รวมข้อมูลสมาชิก, intake, consent, telemed และเอกสารไว้ในหน้าจอเดียวสำหรับแอดมิน
          </p>
        </div>

        <form className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] xl:min-w-[620px]" action="/admin/members">
          <input
            className="min-h-12 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none transition placeholder:text-walkerMuted focus:border-walkerYellow/60 focus:ring-4 focus:ring-walkerYellow/10"
            name="q"
            defaultValue={query}
            placeholder="ค้นหาชื่อ, เบอร์โทร, Email, Member ID"
          />
          <button
            className="min-h-12 rounded-xl bg-walkerYellow px-5 text-sm font-black text-black transition hover:bg-[#ffe36d]"
            type="submit"
          >
            ค้นหา
          </button>
          {query ? (
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/10 px-5 text-sm font-black text-walkerMuted transition hover:border-white/25 hover:text-white"
              href="/admin/members"
            >
              ล้าง
            </Link>
          ) : null}
        </form>
      </div>
    </header>
  );
}

function MemberList({
  rows,
  query,
  selectedId,
}: {
  rows: AdminCustomerSummary[];
  query: string;
  selectedId: string | null;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/55 shadow-[0_0_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-walkerYellow">Admin List</p>
          <h2 className="mt-1 text-xl font-black">สมาชิก {rows.length} รายการ</h2>
        </div>
        <Link className="rounded-xl border border-walkerYellow/25 px-3 py-2 text-xs font-black text-walkerYellow" href="/intake">
          เพิ่มสมาชิก
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="p-5 text-sm text-walkerMuted">ยังไม่มีข้อมูล</div>
      ) : (
        <>
          <div className="hidden overflow-x-auto xl:block">
            <table className="min-w-[1080px] text-left text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.16em] text-walkerMuted">
                <tr>
                  <th className="px-4 py-3">Member ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Latest intake</th>
                  <th className="px-4 py-3">Telemed</th>
                  <th className="px-4 py-3">Consent</th>
                  <th className="px-4 py-3">Last updated</th>
                  <th className="px-4 py-3 text-right">View</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className={row.id === selectedId ? 'bg-walkerYellow/10' : 'border-t border-white/5'}>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-walkerYellow">{row.memberId}</td>
                    <td className="px-4 py-3 font-black">{valueOrEmpty(row.name)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-walkerMuted">{valueOrEmpty(row.phone)}</td>
                    <td className="px-4 py-3 text-walkerMuted">{valueOrEmpty(row.email)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={row.latestIntakeStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={row.telemedStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={row.consentStatus} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-walkerMuted">{formatDateTime(row.updatedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link className="rounded-lg bg-walkerYellow px-3 py-2 text-xs font-black text-black" href={customerHref(row.id, query)}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-3 xl:hidden">
            {rows.map((row) => (
              <Link
                key={row.id}
                href={customerHref(row.id, query)}
                className={`rounded-xl border p-4 transition ${
                  row.id === selectedId
                    ? 'border-walkerYellow/55 bg-walkerYellow/10'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-walkerYellow">{row.memberId}</p>
                    <h3 className="mt-1 font-black">{valueOrEmpty(row.name)}</h3>
                  </div>
                  <span className="rounded-lg bg-walkerYellow px-3 py-2 text-xs font-black text-black">View</span>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-walkerMuted">
                  <p>{valueOrEmpty(row.phone)}</p>
                  <p>{valueOrEmpty(row.email)}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge value={row.latestIntakeStatus} />
                  <StatusBadge value={row.telemedStatus} />
                  <StatusBadge value={row.consentStatus} />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function CustomerDetail({
  customer,
  selectedId,
  returnTo,
}: {
  customer: AdminCustomerDetail;
  selectedId: string | null;
  returnTo: string;
}) {
  const intake = customer.latestIntakeSubmission;
  const memberId = formatAdminMemberId(intake?.id ?? customer.memberProfile?.id ?? customer.user?.id);
  const fullName = customer.memberProfile?.displayName ?? customer.user?.name ?? intake?.fullName ?? EMPTY_TEXT;
  const phone = customer.memberProfile?.phone ?? intake?.phone ?? EMPTY_TEXT;
  const email = customer.user?.email ?? intake?.email ?? EMPTY_TEXT;

  return (
    <section className="grid gap-5">
      <div className="rounded-2xl border border-white/10 bg-black/55 p-5 shadow-[0_0_60px_rgba(0,0,0,0.35)]">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-walkerYellow">Member ID</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="font-mono text-3xl font-black tracking-[-0.04em] text-white md:text-4xl">{memberId}</h2>
              <StatusBadge value={intake?.status ?? PENDING_REVIEW} />
            </div>
            <h3 className="mt-5 text-2xl font-black md:text-3xl">{fullName}</h3>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-walkerMuted">
              <span>{phone}</span>
              <span>{email}</span>
              <span>ลงทะเบียน {formatDateTime(customer.user?.createdAt ?? customer.memberProfile?.createdAt ?? intake?.submittedAt)}</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[420px]">
            <MetricCard label="Current CLASS" value={EMPTY_TEXT} />
            <MetricCard label="Current TIER" value={EMPTY_TEXT} />
            <MetricCard label="Total DUST" value={EMPTY_TEXT} />
            <MetricCard label="Monthly DUST" value={EMPTY_TEXT} />
          </div>
        </div>

        <nav className="mt-5 flex gap-2 overflow-x-auto border-t border-white/10 pt-4 text-sm font-black text-walkerMuted">
          {[
            ['#overview', 'Overview'],
            ['#intake', 'Intake'],
            ['#consent', 'Consent'],
            ['#telemed', 'Telemed'],
            ['#documents', 'Documents'],
            ['#activity', 'Activity'],
          ].map(([href, label]) => (
            <a
              key={href}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-walkerYellow/40 hover:text-walkerYellow"
              href={href}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>

      <div id="overview" className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="grid gap-5">
          <SectionCard title="Member Summary" eyebrow="Overview">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <InfoItem label="Member ID" value={memberId} mono />
              <InfoItem label="Full name" value={fullName} />
              <InfoItem label="Phone" value={phone} />
              <InfoItem label="Email" value={email} />
              <InfoItem label="Date of birth" value={formatDateOnly(customer.memberProfile?.dateOfBirth ?? intake?.dateOfBirth)} />
              <InfoItem label="Registered date" value={formatDateTime(customer.user?.createdAt ?? customer.memberProfile?.createdAt ?? intake?.submittedAt)} />
              <InfoItem label="Current CLASS" value={EMPTY_TEXT} />
              <InfoItem label="Current TIER" value={EMPTY_TEXT} />
              <InfoItem label="Total DUST" value={EMPTY_TEXT} />
              <InfoItem label="Monthly DUST" value={EMPTY_TEXT} />
            </div>
          </SectionCard>

          <div id="intake">
            <IntakeSection customer={customer} />
          </div>

          <div id="consent">
            <ConsentSection records={customer.consentRecords} />
          </div>

          <div id="telemed">
            <TelemedSection requests={customer.telemedRequests} />
          </div>

          <div id="documents">
            <DocumentsSection customer={customer} />
          </div>

          <div id="activity">
            <ActivitySection customer={customer} />
          </div>
        </div>

        <AdminActions
          customer={customer}
          selectedId={selectedId}
          returnTo={returnTo}
        />
      </div>
    </section>
  );
}

function IntakeSection({ customer }: { customer: AdminCustomerDetail }) {
  const intake = customer.latestIntakeSubmission;

  if (!intake) {
    return (
      <SectionCard title="Intake Submission" eyebrow="Intake">
        <EmptyState text={EMPTY_TEXT} />
      </SectionCard>
    );
  }

  const preferredContact = intake.lineId ?? customer.memberProfile?.lineUserId ?? intake.phone ?? intake.email ?? EMPTY_TEXT;

  return (
    <SectionCard title="Intake Submission" eyebrow="Intake" badge={intake.status}>
      <div className="grid gap-4">
        <InfoItem label="Symptoms / reason" value={intake.currentSymptoms ?? intake.intendedUse ?? EMPTY_TEXT} />
        <div className="grid gap-3 md:grid-cols-2">
          <InfoItem label="Intended use" value={intake.intendedUse ?? EMPTY_TEXT} />
          <InfoItem label="Allergies" value={intake.allergies ?? EMPTY_TEXT} />
          <InfoItem label="Medications" value={intake.medications ?? EMPTY_TEXT} />
          <InfoItem label="Prior cannabis experience" value={intake.priorCannabisExperience ?? EMPTY_TEXT} />
          <InfoItem label="Preferred contact" value={preferredContact} />
          <InfoItem label="Submitted date" value={formatDateTime(intake.submittedAt)} />
          <InfoItem label="Status" value={statusLabel(intake.status)} />
        </div>
      </div>
    </SectionCard>
  );
}

function ConsentSection({ records }: { records: ConsentRecord[] }) {
  const combinedConsent = combinedConsentRecord(records);

  return (
    <SectionCard
      title="Combined Consent / ความยินยอมรวม"
      eyebrow="Consent"
      badge={combinedConsent ? (combinedConsent.accepted ? 'Accepted' : PENDING_REVIEW) : undefined}
    >
      <div className="grid gap-4">
        <p className="rounded-xl border border-walkerYellow/20 bg-walkerYellow/10 p-4 text-sm font-bold leading-7 text-[#f7f3df]">
          {COMBINED_CONSENT_COPY}
        </p>

        {combinedConsent ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-walkerMuted">Consent type</p>
                <h3 className="mt-1 font-black">Combined Consent</h3>
              </div>
              <StatusBadge value={combinedConsent.accepted ? 'Accepted' : PENDING_REVIEW} />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <InfoItem label="Accepted status" value={combinedConsent.accepted ? COMBINED_CONSENT_ACCEPTED : PENDING_REVIEW} compact />
              <InfoItem label="Accepted date/time" value={formatDateTime(combinedConsent.createdAt)} compact />
              <InfoItem label="IP address" value={combinedConsent.ipAddress ?? EMPTY_TEXT} compact />
              <InfoItem label="User agent" value={combinedConsent.userAgent ?? EMPTY_TEXT} compact />
              <InfoItem label="Version" value={combinedConsent.consentVersion ?? EMPTY_TEXT} compact />
              <InfoItem label="Source" value={combinedConsent.intakeId ? 'Medical Intake' : EMPTY_TEXT} compact />
            </div>
          </div>
        ) : (
          <EmptyState text={EMPTY_TEXT} />
        )}
      </div>
    </SectionCard>
  );
}

function TelemedSection({ requests }: { requests: TelemedRequest[] }) {
  return (
    <SectionCard title="Telemed Request" eyebrow="Telemed" badge={requests[0]?.status}>
      {requests.length === 0 ? (
        <EmptyState text={EMPTY_TEXT} />
      ) : (
        <div className="grid gap-3">
          {requests.map((request) => (
            <div key={request.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-black">Telemed request</h3>
                <StatusBadge value={request.status} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <InfoItem label="Request status" value={statusLabel(request.status)} />
                <InfoItem label="Meeting date/time" value={formatDateTime(request.preferredDate)} />
                <MeetingLinkItem href={request.meetingLink} />
                <InfoItem label="Approval status" value={statusLabel(request.status)} />
                <InfoItem label="Doctor/admin notes" value={request.adminNotes ?? request.note ?? EMPTY_TEXT} wide />
                <InfoItem label="Approved date" value={formatDateTime(request.approvedAt)} />
                <InfoItem label="Completed date" value={formatDateTime(request.completedAt)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function DocumentsSection({ customer }: { customer: AdminCustomerDetail }) {
  const idDocument = customer.uploadedDocuments.find((document) => document.kind === 'ID_CARD');
  const consentPdf = findGeneratedDocument(customer.generatedDocuments, ['SIGNED_CONSENT', 'CONSENT_PDF']);
  const pt33 = findGeneratedDocument(customer.generatedDocuments, ['PT33']);
  const certificateDraft = findGeneratedDocument(customer.generatedDocuments, ['MEDICAL_CERTIFICATE_DRAFT']);
  const certificateFinal = findGeneratedDocument(customer.generatedDocuments, ['MEDICAL_CERTIFICATE_FINAL']);

  return (
    <SectionCard title="Documents" eyebrow="Documents">
      <div className="grid gap-3 md:grid-cols-2">
        <UploadedDocumentButton label="ID document" document={idDocument} />
        <GeneratedDocumentButton label="Consent PDF" document={consentPdf} />
        <GeneratedDocumentButton label="P.T.33 PDF" document={pt33} />
        <GeneratedDocumentButton label="Medical Certificate Draft PDF" document={certificateDraft} />
        <GeneratedDocumentButton label="Medical Certificate Final PDF" document={certificateFinal} />
      </div>
    </SectionCard>
  );
}

function ActivitySection({ customer }: { customer: AdminCustomerDetail }) {
  const items = activityItems(customer);

  return (
    <SectionCard title="Activity" eyebrow="Activity">
      {items.length === 0 ? (
        <EmptyState text={EMPTY_TEXT} />
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <div key={`${item.label}-${dateValue(item.date)}`} className="grid gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[180px_minmax(0,1fr)]">
              <p className="text-sm font-black text-walkerYellow">{formatDateTime(item.date)}</p>
              <div>
                <h3 className="font-black">{item.label}</h3>
                <p className="mt-1 text-sm text-walkerMuted">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function AdminActions({
  customer,
  selectedId,
  returnTo,
}: {
  customer: AdminCustomerDetail;
  selectedId: string | null;
  returnTo: string;
}) {
  const intakeId = customer.latestIntakeSubmission?.id;
  const telemedId = customer.telemedRequests[0]?.id;
  const telemedRequest = customer.telemedRequests[0] ?? null;

  return (
    <aside className="sticky top-5 grid self-start rounded-2xl border border-white/10 bg-black/55 p-5 shadow-[0_0_60px_rgba(0,0,0,0.35)]">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-walkerYellow">Admin Actions</p>
      <h2 className="mt-2 text-xl font-black">Actions</h2>
      <div className="mt-4 grid gap-2">
        <ActionForm
          customerId={selectedId}
          action="approve-intake"
          label="Approve Intake"
          returnTo={returnTo}
          disabled={!intakeId}
          tone="green"
        />
        <ActionForm
          customerId={selectedId}
          action="approve-telemed"
          label="Approve Telemed"
          returnTo={returnTo}
          disabled={!telemedId}
          tone="green"
        />
        <MeetingLinkForm
          customerId={selectedId}
          returnTo={returnTo}
          disabled={!intakeId}
          defaultMeetingLink={telemedRequest?.meetingLink ?? ''}
          defaultAdminNotes={telemedRequest?.adminNotes ?? ''}
          defaultMeetingDate={formatDateTimeInput(telemedRequest?.preferredDate)}
        />
        <ActionForm
          customerId={selectedId}
          action="mark-consultation-completed"
          label="Mark Consultation Completed"
          returnTo={returnTo}
          disabled={!intakeId && !telemedId}
          tone="purple"
        />
        <ActionForm
          customerId={selectedId}
          action="generate-pt33"
          label="Generate P.T.33 PDF"
          returnTo={returnTo}
          disabled={!intakeId}
          tone="yellow"
        />
        <ActionForm
          customerId={selectedId}
          action="generate-medical-certificate-draft"
          label="Generate Medical Certificate Draft"
          returnTo={returnTo}
          disabled={!intakeId}
          tone="yellow"
        />
        <FinalCertificateUploadForm
          customerId={selectedId}
          returnTo={returnTo}
          disabled={!intakeId}
        />
        <CopyMemberPortalLink href="/member" />
      </div>
    </aside>
  );
}

function ActionForm({
  customerId,
  action,
  label,
  returnTo,
  disabled,
  tone,
}: {
  customerId: string | null;
  action: string;
  label: string;
  returnTo: string;
  disabled?: boolean;
  tone: 'green' | 'yellow' | 'purple';
}) {
  const toneClass = {
    green: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200 hover:border-emerald-300/45 hover:bg-emerald-300/15',
    yellow: 'border-walkerYellow/25 bg-walkerYellow/10 text-walkerYellow hover:border-walkerYellow/50 hover:bg-walkerYellow/15',
    purple: 'border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-200 hover:border-fuchsia-300/45 hover:bg-fuchsia-300/15',
  }[tone];

  return (
    <form action={customerId ? `/api/admin/customers/${customerId}/actions` : '#'} method="post">
      <input type="hidden" name="action" value={action} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <button
        className={`min-h-11 w-full rounded-xl border px-4 text-left text-sm font-black transition disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-walkerMuted ${toneClass}`}
        disabled={disabled || !customerId}
        type="submit"
      >
        {label}
      </button>
    </form>
  );
}

function MeetingLinkForm({
  customerId,
  returnTo,
  disabled,
  defaultMeetingLink,
  defaultAdminNotes,
  defaultMeetingDate,
}: {
  customerId: string | null;
  returnTo: string;
  disabled?: boolean;
  defaultMeetingLink: string;
  defaultAdminNotes: string;
  defaultMeetingDate: string;
}) {
  return (
    <form
      action={customerId ? `/api/admin/customers/${customerId}/actions` : '#'}
      className="grid gap-2 rounded-xl border border-sky-300/20 bg-sky-300/10 p-3"
      method="post"
    >
      <input type="hidden" name="action" value="add-meeting-link" />
      <input type="hidden" name="returnTo" value={returnTo} />
      <label className="grid gap-1 text-xs font-black uppercase tracking-[0.14em] text-sky-200">
        Add Meeting Link
        <input
          className="min-h-10 rounded-lg border border-white/10 bg-black/35 px-3 text-sm normal-case tracking-normal text-white outline-none focus:border-sky-300/50"
          defaultValue={defaultMeetingLink}
          disabled={disabled || !customerId}
          name="meetingLink"
          placeholder="https://meet.google.com/..."
          type="text"
        />
      </label>
      <label className="grid gap-1 text-xs font-black uppercase tracking-[0.14em] text-sky-200">
        Meeting date/time
        <input
          className="min-h-10 rounded-lg border border-white/10 bg-black/35 px-3 text-sm normal-case tracking-normal text-white outline-none focus:border-sky-300/50"
          defaultValue={defaultMeetingDate}
          disabled={disabled || !customerId}
          name="meetingDate"
          type="datetime-local"
        />
      </label>
      <label className="grid gap-1 text-xs font-black uppercase tracking-[0.14em] text-sky-200">
        Admin notes
        <textarea
          className="min-h-20 rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none focus:border-sky-300/50"
          defaultValue={defaultAdminNotes}
          disabled={disabled || !customerId}
          name="adminNotes"
          placeholder="โน้ตสำหรับแอดมิน / หมอ"
        />
      </label>
      <button
        className="min-h-10 rounded-lg border border-sky-300/30 bg-sky-300/15 px-3 text-left text-sm font-black text-sky-100 transition hover:border-sky-300/55 hover:bg-sky-300/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-walkerMuted"
        disabled={disabled || !customerId}
        type="submit"
      >
        บันทึก Meeting Link
      </button>
    </form>
  );
}

function FinalCertificateUploadForm({
  customerId,
  returnTo,
  disabled,
}: {
  customerId: string | null;
  returnTo: string;
  disabled?: boolean;
}) {
  return (
    <form
      action={customerId ? `/api/admin/customers/${customerId}/actions` : '#'}
      className="grid gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3"
      encType="multipart/form-data"
      method="post"
    >
      <input type="hidden" name="action" value="upload-final-certificate" />
      <input type="hidden" name="returnTo" value={returnTo} />
      <label className="grid gap-1 text-xs font-black uppercase tracking-[0.14em] text-walkerMuted">
        Upload/Attach Final Certificate
        <input
          accept="application/pdf"
          className="block w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-xs text-walkerMuted file:mr-3 file:rounded-md file:border-0 file:bg-walkerYellow file:px-3 file:py-2 file:text-xs file:font-black file:text-black"
          disabled={disabled || !customerId}
          name="finalCertificate"
          type="file"
        />
      </label>
      <button
        className="min-h-10 rounded-lg border border-white/15 bg-white/[0.06] px-3 text-left text-sm font-black text-white transition hover:border-walkerYellow/45 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-walkerMuted"
        disabled={disabled || !customerId}
        type="submit"
      >
        อัปโหลด Final Certificate
      </button>
    </form>
  );
}

function SectionCard({
  title,
  eyebrow,
  badge,
  children,
}: {
  title: string;
  eyebrow: string;
  badge?: string | null;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/55 p-5 shadow-[0_0_60px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-walkerYellow">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-black">{title}</h2>
        </div>
        {badge ? <StatusBadge value={badge} /> : null}
      </div>
      {children}
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-walkerMuted">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}

function InfoItem({
  label,
  value,
  mono,
  compact,
  wide,
}: {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
  compact?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/[0.03] ${compact ? 'p-3' : 'p-4'} ${wide ? 'md:col-span-2' : ''}`}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-walkerMuted">{label}</p>
      <p className={`mt-2 break-words text-sm font-bold leading-6 text-white ${mono ? 'font-mono' : ''}`}>
        {valueOrEmpty(value)}
      </p>
    </div>
  );
}

function MeetingLinkItem({ href }: { href: string | null | undefined }) {
  if (!href) {
    return <InfoItem label="Meeting link" value={EMPTY_TEXT} />;
  }

  return (
    <div className="rounded-xl border border-sky-300/20 bg-sky-300/10 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-walkerMuted">Meeting link</p>
      <a
        className="mt-2 block break-all text-sm font-black leading-6 text-sky-200 underline decoration-sky-200/30 underline-offset-4"
        href={href}
        rel="noreferrer"
        target="_blank"
      >
        {href}
      </a>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-sm text-walkerMuted">{text}</div>;
}

function StatusBadge({ value }: { value: string | null | undefined }) {
  const raw = valueOrEmpty(value);
  const normalized = raw.toUpperCase();
  const good = ['COMPLETED', 'SCHEDULED', 'AVAILABLE', 'ACCEPTED', 'ยอมรับแล้ว', 'อนุมัติแล้ว'].includes(normalized);
  const pending = ['SUBMITTED', 'UNDER_REVIEW', 'REQUESTED', 'REVIEWING', 'PROCESSING', PENDING_REVIEW].includes(normalized);
  const cancelled = ['CANCELLED', 'REJECTED', 'REVOKED'].includes(normalized);
  const style = good
    ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
    : pending
      ? 'border-walkerYellow/25 bg-walkerYellow/10 text-walkerYellow'
      : cancelled
        ? 'border-red-400/25 bg-red-400/10 text-red-200'
        : 'border-white/10 bg-white/[0.04] text-walkerMuted';

  return (
    <span className={`inline-flex min-h-7 items-center rounded-full border px-3 text-xs font-black ${style}`}>
      {statusLabel(raw)}
    </span>
  );
}

function UploadedDocumentButton({
  label,
  document,
}: {
  label: string;
  document?: UploadedDocument;
}) {
  if (!document) {
    return <DocumentShell label={label} value={NOT_UPLOADED} muted />;
  }

  return (
    <DocumentShell
      label={label}
      value={`อัปโหลดแล้ว: ${document.originalName}`}
      meta={`${document.mimeType} / ${formatBytes(document.sizeBytes)}`}
    />
  );
}

function GeneratedDocumentButton({
  label,
  document,
}: {
  label: string;
  document?: AdminGeneratedDocument;
}) {
  if (!document) {
    return <DocumentShell label={label} value={NOT_GENERATED} muted />;
  }

  if (!document.hasFile) {
    return <DocumentShell label={label} value={NO_FILE} meta={statusLabel(document.status)} muted />;
  }

  return (
    <a
      className="rounded-xl border border-walkerYellow/25 bg-walkerYellow/10 p-4 transition hover:border-walkerYellow/55 hover:bg-walkerYellow/15"
      href={`/api/admin/documents/${document.id}/download?disposition=inline`}
      rel="noreferrer"
      target="_blank"
    >
      <p className="text-xs font-black uppercase tracking-[0.16em] text-walkerMuted">{label}</p>
      <p className="mt-2 text-sm font-black text-walkerYellow">เปิดไฟล์</p>
      <p className="mt-1 text-xs text-walkerMuted">{statusLabel(document.status)}</p>
    </a>
  );
}

function DocumentShell({
  label,
  value,
  meta,
  muted,
}: {
  label: string;
  value: string;
  meta?: string;
  muted?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 ${muted ? 'border-white/10 bg-white/[0.03]' : 'border-emerald-400/20 bg-emerald-400/10'}`}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-walkerMuted">{label}</p>
      <p className={`mt-2 break-words text-sm font-black ${muted ? 'text-walkerMuted' : 'text-emerald-200'}`}>{value}</p>
      {meta ? <p className="mt-1 text-xs text-walkerMuted">{meta}</p> : null}
    </div>
  );
}

function activityItems(customer: AdminCustomerDetail): ActivityItem[] {
  const items: ActivityItem[] = [];
  const intake = customer.latestIntakeSubmission;

  if (intake) {
    items.push({
      label: 'ส่ง Intake Submission',
      detail: statusLabel(intake.status),
      date: intake.submittedAt,
    });
  }

  const combinedConsent = combinedConsentRecord(customer.consentRecords);

  if (combinedConsent) {
    items.push({
      label: 'Combined Consent Accepted',
      detail: combinedConsent.accepted ? COMBINED_CONSENT_ACCEPTED : PENDING_REVIEW,
      date: combinedConsent.createdAt,
    });
  }

  for (const telemed of customer.telemedRequests) {
    items.push({
      label: 'Telemed Request',
      detail: statusLabel(telemed.status),
      date: telemed.requestedAt,
    });
  }

  for (const document of customer.generatedDocuments) {
    items.push({
      label: document.title,
      detail: `${document.documentType} / ${statusLabel(document.status)}`,
      date: document.updatedAt,
    });
  }

  return items.sort((a, b) => {
    const aTime = dateValue(a.date);
    const bTime = dateValue(b.date);
    return bTime - aTime;
  });
}

function combinedConsentRecord(records: ConsentRecord[]) {
  if (records.length === 0) {
    return null;
  }

  const acceptedRecords = records.filter((record) => record.accepted);
  const candidates = acceptedRecords.length > 0 ? acceptedRecords : records;

  return candidates.reduce((latest, record) =>
    dateValue(record.createdAt) > dateValue(latest.createdAt) ? record : latest,
  );
}

function findGeneratedDocument(documents: AdminGeneratedDocument[], types: string[]) {
  return documents.find((document) => types.includes(document.documentType));
}

function customerHref(customerId: string, query: string) {
  const params = new URLSearchParams();

  if (query) {
    params.set('q', query);
  }

  params.set('customer', customerId);
  return `/admin/members?${params.toString()}`;
}

function createReturnTo(query: string, selectedId: string | null) {
  const params = new URLSearchParams();

  if (query) {
    params.set('q', query);
  }

  if (selectedId) {
    params.set('customer', selectedId);
  }

  const suffix = params.toString();
  return suffix ? `/admin/members?${suffix}` : '/admin/members';
}

function formatDateTime(value: Date | string | null | undefined) {
  const date = parseDate(value);

  if (!date) {
    return EMPTY_TEXT;
  }

  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  }).format(date);
}

function formatDateOnly(value: Date | string | null | undefined) {
  const date = parseDate(value);

  if (!date) {
    return EMPTY_TEXT;
  }

  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeZone: 'Asia/Bangkok',
  }).format(date);
}

function formatDateTimeInput(value: Date | string | null | undefined) {
  const date = parseDate(value);

  if (!date) {
    return '';
  }

  const offsetDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return offsetDate.toISOString().slice(0, 16);
}

function parseDate(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function dateValue(value: Date | string | null) {
  return parseDate(value)?.getTime() ?? 0;
}

function statusLabel(value: string | null | undefined) {
  const raw = valueOrEmpty(value);
  const labels: Record<string, string> = {
    SUBMITTED: PENDING_REVIEW,
    UNDER_REVIEW: 'กำลังตรวจสอบ',
    COMPLETED: 'อนุมัติแล้ว',
    CANCELLED: 'ยกเลิก',
    REQUESTED: 'รอนัดหมาย',
    REVIEWING: 'กำลังตรวจสอบ',
    SCHEDULED: 'นัดหมายแล้ว',
    PROCESSING: 'กำลังสร้างเอกสาร',
    AVAILABLE: 'พร้อมใช้งาน',
    REVOKED: 'ปิดใช้งาน',
    ACCEPTED: 'ยอมรับแล้ว',
    PENDING: PENDING_REVIEW,
  };

  return labels[raw.toUpperCase()] ?? raw;
}

function valueOrEmpty(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return EMPTY_TEXT;
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return EMPTY_TEXT;
  }

  return String(value);
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) {
    return EMPTY_TEXT;
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
