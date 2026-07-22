const quickAccess = [
  {
    href: '/intake',
    icon: '♙',
    title: 'Register Intake',
    text: 'New here? Start your intake and take the first step with WEED WALKER.',
    cta: 'Start Intake'
  },
  {
    href: '/member',
    icon: '▣',
    title: 'Access Portal',
    text: 'Existing member? Securely access your application status and documents.',
    cta: 'Enter Portal'
  },
  {
    href: '/access',
    icon: '◎',
    title: 'Access Level',
    text: 'Understand Visitor, Walker, Keeper, and Light Force access levels.',
    cta: 'View Access'
  },
  {
    href: '/menu',
    icon: '☷',
    title: 'Flight Menu',
    text: 'Browse simple visual tiers before talking to a budtender.',
    cta: 'Open Menu'
  }
];

const cultivationSystems = [
  {
    group: 'Nature',
    tone: 'Living ecosystems. Full spectrum life.',
    items: [
      { icon: '✥', title: 'Living Soil', text: 'Water-only living soil with a richer natural profile.' },
      { icon: '☀', title: 'Sungrown Hybrid Indoor', text: 'Sunlight influenced. Indoor perfected.' },
      { icon: '⌂', title: 'Home Grow Coco', text: 'Clean coco cultivation for consistent batches.' }
    ]
  },
  {
    group: 'Lab',
    tone: 'Clean medium. Controlled environment.',
    items: [
      { icon: '⌬', title: 'Sterile Coco', text: 'Controlled medium for clear, stable flower quality.' },
      { icon: '◌', title: 'Hydroponics Rockwool', text: 'Precision grown for consistent results.' },
      { icon: '✺', title: 'Aeroponics', text: 'Rooted in air. Elevated yield and efficiency.' }
    ]
  }
];

const communityCards = [
  {
    title: 'Rap Challenge',
    text: 'Real voices. Real stories. Real impact.',
    gradient: 'from-[#35100a] via-[#140907] to-black'
  },
  {
    title: 'Football Sponsorship',
    text: 'Fueling talent and building champions.',
    gradient: 'from-[#0d2b20] via-[#07140f] to-black'
  },
  {
    title: 'Seasonal Campaigns',
    text: 'Creative drops, local culture, and member moments.',
    gradient: 'from-[#2b2108] via-[#100c05] to-black'
  },
  {
    title: 'Community Activities',
    text: 'Chokchai 4 energy, cannabis culture, and better conversations.',
    gradient: 'from-[#1b1632] via-[#090814] to-black'
  }
];

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Intake Portal', href: '/intake' },
  { label: 'Member Portal', href: '/member' },
  { label: 'Access', href: '/access' },
  { label: 'Menu', href: '/menu' }
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#020202] text-[#f8f3dc]">
      <section className="home-hero-section relative border-b border-walkerYellow/15">
        <img
          src="/weedwalker-hero-bg.jpg"
          alt="WEED WALKER portal atmosphere"
          className="home-hero-bg-image"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_14%,rgba(255,210,26,0.18),transparent_24rem),radial-gradient(circle_at_18%_6%,rgba(255,210,26,0.08),transparent_22rem)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.98)_0%,rgba(0,0,0,0.78)_42%,rgba(0,0,0,0.26)_72%,rgba(0,0,0,0.72)_100%)]" />

        <div className="home-shell relative z-10">
          <header className="home-header flex items-center justify-between gap-5 py-5">
            <a href="/" className="flex items-center gap-4" aria-label="WEED WALKER Home">
              <img
                src="/weed-walker-logo-mark.png"
                alt="WEED WALKER"
                className="home-brand-logo h-12 w-12 object-contain drop-shadow-[0_0_18px_rgba(255,210,26,0.35)] md:h-14 md:w-14"
              />
              <span>
                <strong className="home-brand-title block text-xl font-black uppercase tracking-[0.22em] md:text-2xl">
                  WEED WALKER
                </strong>
                <small className="home-brand-subtitle block text-[10px] font-black uppercase tracking-[0.25em] text-walkerYellow">
                  Master of Cannabis
                </small>
              </span>
            </a>

            <nav className="home-nav hidden items-center gap-8 text-xs font-black uppercase tracking-[0.14em] text-[#d8d1b8] lg:flex">
              <a className="text-walkerYellow" href="/">
                Home
              </a>
              <a href="/intake">Intake Portal</a>
              <a href="/member">Member Portal</a>
              <a href="/access">Access</a>
              <a href="/menu">Menu</a>
              <a href="https://lin.ee/yNXeTBs">Contact</a>
            </nav>

            <a
              href="/member"
              className="home-header-cta hidden min-h-12 items-center gap-3 rounded-xl border border-walkerYellow/70 bg-walkerYellow/10 px-5 text-xs font-black uppercase tracking-[0.16em] text-walkerYellow shadow-[0_0_30px_rgba(255,210,26,0.16)] transition hover:bg-walkerYellow hover:text-black md:inline-flex"
            >
              <span>♙</span>
              Member Login
            </a>

            <details className="home-mobile-menu lg:hidden">
              <summary aria-label="Open navigation">☰</summary>
              <nav>
                <a className="text-walkerYellow" href="/">
                  Home
                </a>
                <a href="/intake">Intake Portal</a>
                <a href="/member">Member Portal</a>
                <a href="/access">Access</a>
                <a href="/menu">Menu</a>
                <a href="https://lin.ee/yNXeTBs">Contact</a>
              </nav>
            </details>
          </header>

          <div className="home-hero-grid grid items-center">
            <div>
              <p className="mb-7 flex items-center gap-4 text-xs font-black uppercase tracking-[0.32em] text-walkerYellow">
                Cannabis. Wellness. Lifestyle.
                <span className="hidden h-px w-16 bg-walkerYellow/65 sm:block" />
              </p>

              <h1 className="home-hero-heading max-w-3xl font-serif text-[clamp(3.4rem,8vw,6.4rem)] leading-[0.93] tracking-[-0.055em]">
                From Soil to Power.
                <span className="block">
                  From Science to <span className="text-walkerYellow">Soul.</span>
                </span>
              </h1>

              <div className="my-8 h-px max-w-xl bg-gradient-to-r from-walkerYellow via-walkerYellow/45 to-transparent" />

              <p className="home-hero-copy max-w-xl text-base leading-8 text-[#d9d3bd] md:text-lg">
                WEED WALKER is a cannabis experience built on science, sustainability,
                and purpose. We curate knowledge, access, and member journeys for people
                who want to choose cannabis with clarity.
              </p>

              <div className="home-hero-actions mt-9 flex flex-col gap-4 sm:flex-row">
                <a
                  href="/intake"
                  className="inline-flex min-h-14 items-center justify-center gap-4 rounded-xl bg-walkerYellow px-7 text-sm font-black uppercase tracking-[0.08em] text-black shadow-[0_0_42px_rgba(255,210,26,0.28)] transition hover:-translate-y-0.5"
                >
                  Start Intake <span>→</span>
                </a>
                <a
                  href="/member"
                  className="inline-flex min-h-14 items-center justify-center gap-4 rounded-xl border border-walkerYellow/55 bg-black/30 px-7 text-sm font-black uppercase tracking-[0.08em] text-walkerYellow transition hover:-translate-y-0.5 hover:bg-walkerYellow hover:text-black"
                >
                  Access Portal <span>→</span>
                </a>
              </div>

              <div className="home-trust-grid mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
                {[
                  ['✥', 'Premium Quality', 'Curated. Tested. Trusted.'],
                  ['▣', 'Privacy First', 'Your data. Your control.'],
                  ['✦', 'Member Experience', 'Built for you, always.']
                ].map(([icon, title, text]) => (
                  <div key={title} className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-walkerYellow/40 bg-walkerYellow/10 text-walkerYellow">
                      {icon}
                    </span>
                    <span>
                      <strong className="block text-xs font-black uppercase tracking-[0.12em]">
                        {title}
                      </strong>
                      <small className="mt-1 block text-xs text-walkerMuted">{text}</small>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="home-hero-visual relative overflow-hidden rounded-[2rem] border border-walkerYellow/20 bg-black shadow-[0_0_80px_rgba(0,0,0,0.62)]">
              <img
                src="/weedwalker-hero-bg.jpg"
                alt="WEED WALKER portal atmosphere"
                className="home-hero-image absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_42%,rgba(255,210,26,0.25),transparent_13rem),linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.72))]" />
              <div className="absolute left-8 top-8 grid h-20 w-20 place-items-center rounded-full border border-walkerYellow/50 bg-black/50 text-4xl font-black text-walkerYellow shadow-[0_0_42px_rgba(255,210,26,0.28)]">
                W
              </div>
              <div className="home-hero-security-card absolute bottom-8 left-6 right-6 rounded-3xl border border-white/15 bg-black/62 p-5 backdrop-blur-md md:left-auto md:w-[370px]">
                <div className="flex gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-walkerYellow/40 bg-walkerYellow/10 text-2xl text-walkerYellow">
                    ◇
                  </span>
                  <div>
                    <p className="font-black text-[#f8f3dc]">ระบบปลอดภัย มั่นใจได้</p>
                    <p className="mt-1 text-sm leading-6 text-[#d9d3bd]">
                      ข้อมูลของคุณได้รับการปกป้องและใช้เพื่อประสบการณ์สมาชิกเท่าที่จำเป็น
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-shell py-12">
        <SectionTitle title="Quick Access" />
        <div className="home-quick-grid grid">
          {quickAccess.map((card) => (
            <a
              key={card.title}
              href={card.href}
              className="group rounded-3xl border border-walkerYellow/20 bg-[linear-gradient(145deg,rgba(18,18,15,0.92),rgba(4,4,4,0.96))] p-6 shadow-[0_0_70px_rgba(0,0,0,0.38)] transition hover:-translate-y-1 hover:border-walkerYellow/60"
            >
              <span className="grid h-16 w-16 place-items-center rounded-full border border-walkerYellow/45 bg-walkerYellow/10 text-3xl text-walkerYellow shadow-[0_0_35px_rgba(255,210,26,0.16)]">
                {card.icon}
              </span>
              <h2 className="mt-6 text-xl font-black uppercase tracking-[0.08em]">{card.title}</h2>
              <p className="mt-3 min-h-16 text-sm leading-6 text-walkerMuted">{card.text}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-walkerYellow">
                {card.cta} <span className="transition group-hover:translate-x-1">→</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="home-shell py-8">
        <SectionTitle title="Cultivation Systems" />
        <div className="overflow-hidden rounded-[2rem] border border-walkerYellow/20 bg-black/70">
          <div className="grid lg:grid-cols-2">
            {cultivationSystems.map((system) => (
              <div
                key={system.group}
                className="relative border-b border-walkerYellow/15 p-6 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0 md:p-8"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,210,26,0.12),transparent_18rem)]" />
                <div className="relative">
                  <p className="text-center text-sm font-black uppercase tracking-[0.45em] text-[#f8f3dc]">
                    {system.group}
                  </p>
                  <p className="mt-2 text-center text-xs text-walkerMuted">{system.tone}</p>
                  <div className="mt-8 grid gap-5 sm:grid-cols-3">
                    {system.items.map((item) => (
                      <div key={item.title} className="text-center">
                        <span className="mx-auto grid h-12 w-12 place-items-center text-3xl text-walkerYellow">
                          {item.icon}
                        </span>
                        <h3 className="mt-4 text-sm font-black uppercase tracking-[0.1em] text-walkerYellow">
                          {item.title}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-[#d9d3bd]">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-shell py-12">
        <SectionTitle title="Community & Campaigns" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {communityCards.map((card) => (
            <article
              key={card.title}
              className={`min-h-[210px] overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br ${card.gradient} p-5 shadow-[0_0_60px_rgba(0,0,0,0.42)]`}
            >
              <div className="flex h-full flex-col justify-end">
                <h3 className="max-w-[10rem] text-2xl font-black uppercase italic leading-none tracking-[-0.04em] text-walkerYellow">
                  {card.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-[#d9d3bd]">{card.text}</p>
                <a href="https://lin.ee/yNXeTBs" className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-walkerYellow">
                  Learn More →
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-walkerYellow/15 bg-black/70">
        <div className="home-shell grid gap-10 py-10 md:grid-cols-[1.1fr_0.8fr_0.8fr_1.1fr]">
          <div>
            <img src="/weed-walker-logo-mark.png" alt="WEED WALKER" className="h-16 w-16 object-contain" />
            <h2 className="mt-3 text-2xl font-black uppercase tracking-[0.24em] text-walkerYellow">
              WEED WALKER
            </h2>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.22em] text-[#d9d3bd]">
              Cannabis. Wellness. Lifestyle.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.22em] text-walkerYellow">Quick Links</h3>
            <div className="mt-4 grid gap-2 text-sm text-walkerMuted">
              {footerLinks.map((link) => (
                <a key={link.href} href={link.href} className="hover:text-walkerYellow">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.22em] text-walkerYellow">Legal</h3>
            <div className="mt-4 grid gap-2 text-sm text-walkerMuted">
              <a href="/privacy-policy" className="hover:text-walkerYellow">
                Privacy Policy
              </a>
              <a href="/terms-of-use" className="hover:text-walkerYellow">
                Terms & Conditions
              </a>
              <a href="/privacy-policy" className="hover:text-walkerYellow">
                PDPA Rights Request
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.22em] text-walkerYellow">Contact Us</h3>
            <div className="mt-4 grid gap-2 text-sm leading-6 text-walkerMuted">
              <p>WEED WALKER Chokchai 4, Bangkok</p>
              <a href="mailto:weedwalker.th@gmail.com" className="hover:text-walkerYellow">
                weedwalker.th@gmail.com
              </a>
              <a href="https://lin.ee/yNXeTBs" className="hover:text-walkerYellow">
                LINE OA: @weedwalker
              </a>
              <a href="tel:0887899420" className="hover:text-walkerYellow">
                Tel. 0887899420
              </a>
            </div>
          </div>
        </div>
        <p className="border-t border-white/10 py-4 text-center text-xs text-walkerMuted">
          © 2026 WEED WALKER. Science to Soul.
        </p>
      </footer>
    </main>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="mb-6 flex items-center justify-center gap-5">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-walkerYellow/70" />
      <h2 className="text-center text-sm font-black uppercase tracking-[0.42em] text-walkerYellow">
        {title}
      </h2>
      <span className="h-px w-16 bg-gradient-to-r from-walkerYellow/70 to-transparent" />
    </div>
  );
}
