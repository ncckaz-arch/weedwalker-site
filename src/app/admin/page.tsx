import { GoogleSignIn } from '@/components/google-sign-in';
import { getCurrentAdminUser } from '@/lib/admin';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const metadata = {
  title: 'Admin Portal | WEED WALKER',
  description: 'WEED WALKER admin intake and document overview.'
};

export default async function AdminPage() {
  const currentUser = await getCurrentUser();
  const adminUser = await getCurrentAdminUser();

  if (!currentUser) {
    return (
      <main className="walker-shell py-10">
        <section className="walker-card mx-auto grid max-w-2xl gap-5 p-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-walkerYellow">Admin Portal</p>
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
          <p className="text-sm font-black uppercase tracking-[0.22em] text-walkerYellow">Admin Portal</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.05em]">Access Not Configured</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-walkerMuted">
            บัญชี {currentUser.email} ยังไม่มีสิทธิ์ admin หรือยังไม่ได้ตั้งค่า ADMIN_EMAILS / ADMIN_EMAIL ใน Vercel
          </p>
        </section>
      </main>
    );
  }

  const intakes = await prisma.intakeSubmission.findMany({
    orderBy: { submittedAt: 'desc' },
    take: 30,
    include: {
      telemedRequest: true,
      uploadedDocuments: {
        orderBy: { createdAt: 'desc' },
        take: 3
      },
      pdfDocuments: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  return (
    <main className="walker-shell py-8">
      <section className="mb-8">
        <p className="mb-4 inline-flex rounded-full border border-walkerYellow/30 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-walkerYellow">
          Admin Portal
        </p>
        <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.06em] md:text-7xl">
          Intake Review.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#d9d3bd]">
          ตรวจสอบใบสมัคร เอกสารที่อัปโหลด และ PDF workflow สำหรับส่งต่อคลินิกพาร์ทเนอร์
        </p>
      </section>

      <section className="grid gap-5">
        {intakes.map((intake) => (
          <article key={intake.id} className="walker-card grid gap-5 p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-walkerYellow">Member ID</p>
                <h2 className="mt-2 break-all text-2xl font-black">{intake.id}</h2>
                <p className="mt-2 text-sm text-walkerMuted">{intake.fullName} · {intake.phone}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill label={intake.status} />
                <StatusPill label={intake.telemedRequest?.status || 'NO_TELEMED'} />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-walkerYellow">Latest Uploads</p>
                <div className="mt-4 grid gap-3">
                  {intake.uploadedDocuments.length > 0 ? intake.uploadedDocuments.map((upload) => (
                    <div key={upload.id} className="rounded-2xl bg-black/30 p-3">
                      <p className="text-sm font-black">{upload.kind}</p>
                      <p className="mt-1 break-all text-xs text-walkerMuted">{upload.originalName}</p>
                    </div>
                  )) : <p className="text-sm text-walkerMuted">No upload available.</p>}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-walkerYellow">Generated Documents</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {intake.pdfDocuments.length > 0 ? intake.pdfDocuments.map((document) => (
                    <div key={document.id} className="rounded-2xl border border-white/10 bg-black/30 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black">{document.title}</p>
                          <p className="mt-1 text-xs text-walkerMuted">{document.documentType}</p>
                        </div>
                        <StatusPill label={document.status} small />
                      </div>
                      {document.storageKey || document.contentBytes ? (
                        <a
                          className="walker-btn walker-btn-outline mt-3 w-full text-xs"
                          href={`/api/admin/documents/${document.id}/download?disposition=inline`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View PDF
                        </a>
                      ) : (
                        <button className="walker-btn walker-btn-outline mt-3 w-full cursor-not-allowed text-xs opacity-50" disabled>
                          Not Generated
                        </button>
                      )}
                    </div>
                  )) : <p className="text-sm text-walkerMuted">No generated documents yet.</p>}
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function StatusPill({ label, small }: { label: string; small?: boolean }) {
  const isGood = ['AVAILABLE', 'COMPLETED', 'SCHEDULED'].includes(label);
  const isPending = ['PROCESSING', 'SUBMITTED', 'UNDER_REVIEW', 'REQUESTED', 'REVIEWING'].includes(label);
  const style = isGood
    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
    : isPending
      ? 'border-walkerYellow/30 bg-walkerYellow/10 text-walkerYellow'
      : 'border-white/10 bg-white/[0.04] text-walkerMuted';

  return (
    <span className={`rounded-full border px-3 py-1 font-black ${small ? 'text-[0.65rem]' : 'text-xs'} ${style}`}>
      {label}
    </span>
  );
}
