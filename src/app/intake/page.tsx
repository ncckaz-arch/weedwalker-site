import { IntakeForm } from '@/components/intake-form';

export default function IntakePage() {
  return (
    <main className="walker-shell pb-16 pt-8">
      <section className="mb-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-walkerYellow/30 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-walkerYellow">
            Access Within
          </p>
          <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.06em] md:text-7xl">
            Enter the Light Force.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#d9d3bd]">
            WEED WALKER member intake for a conscious cannabis and terpene-led experience.
            Submit your member profile, consent, identity details, and Telemed intention so the team can prepare your curated journey.
          </p>
        </div>

        <div className="walker-card p-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-walkerYellow">Science to Soul</p>
          <p className="mt-3 text-sm leading-6 text-walkerMuted">
            This is the weedwalker.net frontend. Apps Script can stay behind the scenes as a temporary workflow backend.
          </p>
        </div>
      </section>

      <IntakeForm />
    </main>
  );
}
