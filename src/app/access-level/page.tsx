const levels = [
  {
    name: 'Visitor',
    subtitle: 'First contact',
    description: 'For new customers exploring WEED WALKER, intake, menu, and conscious cannabis guidance.',
    signal: 'Open access'
  },
  {
    name: 'Walker',
    subtitle: 'Member entry',
    description: 'For customers who want a saved member identity, returning access, and a cleaner experience path.',
    signal: 'Member profile'
  },
  {
    name: 'Keeper',
    subtitle: 'Trusted member',
    description: 'For returning members who keep documents, requests, and experience records organized.',
    signal: 'Document access'
  },
  {
    name: 'Light Force',
    subtitle: 'Inner circle',
    description: 'For deeper WEED WALKER community access, guided experience, and future member-only drops.',
    signal: 'Community access'
  }
];

export default function AccessLevelPage() {
  return (
    <main className="walker-shell pb-16 pt-8">
      <section className="mb-10">
        <p className="mb-4 inline-flex rounded-full border border-walkerYellow/30 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-walkerYellow">
          Access System
        </p>
        <h1 className="walker-page-title max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.06em] md:text-7xl">
          Visitor. Walker. Keeper. Light Force.
        </h1>
        <p className="walker-page-copy mt-5 max-w-2xl text-lg leading-8 text-[#d9d3bd]">
          Access Level keeps the WEED WALKER experience clear: from first visit to member identity,
          document access, and deeper community participation.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {levels.map((level, index) => (
          <article key={level.name} className="walker-card grid min-h-[320px] content-between p-6">
            <div>
              <span className="text-sm font-black text-walkerYellow">{String(index + 1).padStart(2, '0')}</span>
              <h2 className="mt-4 text-4xl font-black uppercase leading-none tracking-[-0.06em]">{level.name}</h2>
              <p className="mt-2 text-sm font-black uppercase tracking-[0.18em] text-[#e8d778]">{level.subtitle}</p>
              <p className="mt-5 text-sm leading-6 text-walkerMuted">{level.description}</p>
            </div>
            <div className="mt-8 rounded-2xl border border-walkerYellow/20 bg-walkerYellow/10 px-4 py-3 text-sm font-black text-walkerYellow">
              {level.signal}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
