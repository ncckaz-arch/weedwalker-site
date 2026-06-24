export default function HomePage() {
  const entryCards = [
    {
      href: '/intake',
      tag: '01',
      title: 'Intake Portal',
      text: 'Start intake, upload documents, give consent, and request telemed flow without requiring Google Login.',
      cta: 'Start Intake'
    },
    {
      href: '/access',
      tag: '02',
      title: 'Access Level',
      text: 'Visitor, Walker, Keeper, and Light Force — a simple member access path for the WEED WALKER experience.',
      cta: 'View Levels'
    },
    {
      href: '/menu',
      tag: '03',
      title: 'Flight Menu',
      text: 'A clean visual menu grouped by gram tier so customers can choose quickly before talking to a budtender.',
      cta: 'Open Menu'
    }
  ];

  return (
    <main className="walker-shell pb-16 pt-8">
      <section className="grid min-h-[72vh] items-center gap-10">
        <div className="max-w-5xl">
          <p className="mb-5 inline-flex rounded-full border border-walkerYellow/30 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-walkerYellow">
            Science to Soul
          </p>
          <h1 className="max-w-4xl text-6xl font-black uppercase leading-[0.88] tracking-[-0.08em] md:text-8xl">
            Master of Cannabis
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#d9d3bd]">
            WEED WALKER is a premium cannabis experience in Bangkok built around Intake,
            Access Level, and a simple Flight Menu.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {entryCards.map((card) => (
            <a key={card.href} href={card.href} className="walker-card group grid min-h-[310px] content-between p-6 transition hover:-translate-y-1 hover:border-walkerYellow/50">
              <div>
                <span className="text-sm font-black text-walkerYellow">{card.tag}</span>
                <h2 className="mt-4 text-4xl font-black uppercase leading-none tracking-[-0.06em]">{card.title}</h2>
                <p className="mt-5 text-sm leading-6 text-walkerMuted">{card.text}</p>
              </div>
              <span className="mt-8 inline-flex font-black text-walkerYellow">{card.cta} →</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
