const flightMenu = [
  {
    tier: '250 / gram',
    label: 'Everyday Flight',
    items: ['Smooth Coco A', 'Local Walker', 'Daylight Batch']
  },
  {
    tier: '350 / gram',
    label: 'Signature Flight',
    items: ['Golden Coco', 'Craft Walker', 'Terp Line']
  },
  {
    tier: '450 / gram',
    label: 'Premium Flight',
    items: ['Exotic Medical', 'Jedi Craft', 'Keeper Batch']
  },
  {
    tier: '600 / gram',
    label: 'Top Shelf Flight',
    items: ['Light Force Reserve', 'Aero Pulse', 'Master Selection']
  }
];

export default function MenuPage() {
  return (
    <main className="walker-shell pb-16 pt-8">
      <section className="mb-10">
        <p className="mb-4 inline-flex rounded-full border border-walkerYellow/30 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-walkerYellow">
          WEED WALKER Flight Menu
        </p>
        <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.06em] md:text-7xl">
          Choose your flight.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#d9d3bd]">
          Simple visual menu grouped by gram tier. Talk to a budtender before choosing.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {flightMenu.map((group) => (
          <article key={group.tier} className="walker-card overflow-hidden">
            <div className="border-b border-walkerYellow/20 bg-walkerYellow px-6 py-5 text-walkerBlack">
              <p className="text-sm font-black uppercase tracking-[0.2em]">{group.label}</p>
              <h2 className="mt-1 text-5xl font-black tracking-[-0.08em]">{group.tier}</h2>
            </div>
            <div className="grid gap-3 p-6">
              {group.items.map((item) => (
                <div key={item} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                  <span className="font-black">{item}</span>
                  <span className="rounded-full bg-walkerYellow/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-walkerYellow">
                    Flight
                  </span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
