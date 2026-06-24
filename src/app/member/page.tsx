import { MemberPanel } from '@/components/member-panel';

export default function MemberPage() {
  const memberAccessEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN === 'true';

  return (
    <main className="walker-shell pb-16 pt-8">
      <section className="mb-8">
        <p className="mb-4 inline-flex rounded-full border border-walkerYellow/30 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-walkerYellow">
          Member Interface
        </p>
        <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.06em] md:text-7xl">
          Your WEED WALKER profile.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#d9d3bd]">
          จัดการ member profile, Google account mapping และ PDF document access
          ที่เกิดจากประสบการณ์บน weedwalker.net
        </p>
      </section>
      {memberAccessEnabled ? (
        <MemberPanel />
      ) : (
        <section className="walker-card p-6">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-walkerYellow">First launch</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">Member protected access is disabled.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-walkerMuted">
            Intake Portal is online first. Google Login, member profile, PDF access, and returning-user status tracking can be enabled later through environment variables.
          </p>
          <a className="walker-btn walker-btn-primary mt-6" href="/intake">Go to Intake</a>
        </section>
      )}
    </main>
  );
}
