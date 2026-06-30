import { prisma } from '@/lib/db';
import { formatPublicMemberId } from '@/lib/member-id';

export const metadata = {
  title: 'Application Submitted | WEED WALKER',
  description: 'WEED WALKER intake submission confirmation.'
};

type SubmittedPageProps = {
  searchParams: {
    intakeId?: string;
    token?: string;
  };
};

export default async function SubmittedPage({ searchParams }: SubmittedPageProps) {
  const intakeId = typeof searchParams.intakeId === 'string' ? searchParams.intakeId : '';
  const token = typeof searchParams.token === 'string' ? searchParams.token : '';

  const signedDocument = intakeId && token
    ? await prisma.pdfDocument.findFirst({
        where: {
          intakeId,
          accessToken: token,
          documentType: 'SIGNED_CONSENT',
          status: 'AVAILABLE'
        },
        include: {
          intake: true
        }
      })
    : null;

  if (!signedDocument?.intake) {
    return (
      <main className="walker-shell py-10">
        <section className="walker-card p-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-walkerYellow">Application Submitted</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">ไม่พบข้อมูลการยืนยัน</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-walkerMuted">
            ลิงก์นี้ไม่ถูกต้องหรือหมดสิทธิ์การเข้าถึง กรุณาเข้าสู่ Member Portal ด้วย Google เพื่อดูสถานะและเอกสารของคุณ
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="walker-btn walker-btn-primary" href="/member">Go to Member Portal</a>
            <a className="walker-btn walker-btn-outline" href="/">Return to Home</a>
          </div>
        </section>
      </main>
    );
  }

  const intake = signedDocument.intake;
  const viewUrl = `/api/intake/documents/${signedDocument.id}/download?token=${encodeURIComponent(token)}&disposition=inline`;
  const downloadUrl = `/api/intake/documents/${signedDocument.id}/download?token=${encodeURIComponent(token)}`;

  return (
    <main className="walker-shell py-8 md:py-12">
      <section className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-walkerYellow/20 bg-black/70 shadow-[0_0_90px_rgba(0,0,0,0.65)]">
        <div className="bg-[radial-gradient(circle_at_50%_0%,rgba(255,210,26,0.18),transparent_24rem)] p-6 text-center md:p-10">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-[2rem] border border-emerald-300/35 bg-emerald-400/10 text-5xl text-emerald-300 shadow-[0_0_42px_rgba(16,185,129,0.25)]">
            ✓
          </div>
          <p className="mt-8 text-sm font-black uppercase tracking-[0.24em] text-walkerYellow">Application Submitted</p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.06em] text-[#f8f3dc] md:text-6xl">
            Application Submitted Successfully
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#d9d3bd] md:text-lg">
            Thank you. Your intake has been received successfully. Our team will review your information and contact you if additional information is required.
          </p>
        </div>

        <div className="grid gap-5 p-5 md:p-8">
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard label="Member ID" value={formatPublicMemberId(intake.id)} />
            <InfoCard label="Submission Date & Time" value={formatDateTime(intake.submittedAt)} />
            <InfoCard label="Current Status" value="Under Review" highlight />
          </div>

          <section className="rounded-3xl border border-walkerYellow/18 bg-white/[0.035] p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-walkerYellow">Status</p>
                <h2 className="mt-2 text-2xl font-black">🟡 Under Review</h2>
                <p className="mt-2 text-sm leading-7 text-walkerMuted">
                  We are currently reviewing your application. Typical review time: 1–2 business days.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-walkerYellow">Progress</p>
            <div className="mt-5 grid gap-3 md:grid-cols-5">
              <ProgressItem state="done" label="Application Submitted" />
              <ProgressItem state="active" label="Under Review" />
              <ProgressItem state="pending" label="Documents Approved" />
              <ProgressItem state="pending" label="Telemedicine Scheduled" />
              <ProgressItem state="pending" label="Completed" />
            </div>
          </section>

          <section className="rounded-3xl border border-walkerYellow/20 bg-[radial-gradient(circle_at_100%_0%,rgba(255,210,26,0.08),transparent_18rem)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-walkerYellow">Signed Document</p>
                <h2 className="mt-2 text-2xl font-black">Signed Consent Form</h2>
                <p className="mt-1 text-sm font-bold text-emerald-300">Signed successfully</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a className="walker-btn walker-btn-outline" href={viewUrl} target="_blank" rel="noreferrer">View PDF</a>
                <a className="walker-btn walker-btn-primary" href={downloadUrl}>Download PDF</a>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <a className="walker-btn walker-btn-primary min-w-52" href="/member">Go to Member Portal</a>
            <a className="walker-btn walker-btn-outline min-w-44" href="/">Return to Home</a>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-walkerMuted">{label}</p>
      <p className={`mt-2 break-words text-sm font-black ${highlight ? 'text-walkerYellow' : 'text-[#f7f3df]'}`}>{value}</p>
    </div>
  );
}

function ProgressItem({ state, label }: { state: 'done' | 'active' | 'pending'; label: string }) {
  const styles =
    state === 'done'
      ? 'border-emerald-400/35 bg-emerald-400/10 text-emerald-300'
      : state === 'active'
        ? 'border-walkerYellow/45 bg-walkerYellow/10 text-walkerYellow'
        : 'border-white/10 bg-white/[0.025] text-walkerMuted';

  return (
    <div className={`rounded-2xl border p-4 text-center ${styles}`}>
      <div className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-black/35 text-sm font-black">
        {state === 'done' ? '✓' : state === 'active' ? '●' : '○'}
      </div>
      <p className="mt-3 text-xs font-black leading-5">{label}</p>
    </div>
  );
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok'
  }).format(date);
}
