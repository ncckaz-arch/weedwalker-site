import type { Metadata } from 'next';

type AccessLevel = {
  name: string;
  range: string;
  benefit: string;
  goal: string;
  emblem: string;
  signal: string;
  cardClass: string;
  emblemClass: string;
  glowClass: string;
};

const accessConfig = {
  conversionNotice: '1 บาท = 25 DUST',
  class: {
    label: '1. CLASS',
    title: 'Lifetime Member',
    subtitle: 'ระดับสมาชิกตลอดอายุ',
    description: [
      'CLASS คือระดับสมาชิกตลอดอายุ',
      'คำนวณจาก DUST สะสมทั้งหมด',
      'เมื่อถึงระดับแล้วจะไม่ตก'
    ],
    levels: [
      {
        name: 'Visitor',
        range: '0 - 124,975 DUST',
        benefit: '0%',
        goal: 'Visitor -> Walker at 125,000 DUST',
        emblem: 'V',
        signal: 'Entry Scan',
        cardClass: 'border-white/20 from-[#202620] via-[#111810] to-[#050805]',
        emblemClass: 'border-white/40 bg-white/10 text-white',
        glowClass: 'bg-white/20'
      },
      {
        name: 'Walker',
        range: '125,000 - 1,249,975 DUST',
        benefit: '5%',
        goal: 'Walker -> Keeper at 1,250,000 DUST',
        emblem: 'W',
        signal: 'Path Open',
        cardClass: 'border-[#a7ff3f]/50 from-[#183b10] via-[#0c2208] to-[#041006]',
        emblemClass: 'border-[#a7ff3f]/60 bg-[#a7ff3f]/20 text-[#caff7a]',
        glowClass: 'bg-[#a7ff3f]/30'
      },
      {
        name: 'Keeper',
        range: '1,250,000 - 2,499,975 DUST',
        benefit: '10%',
        goal: 'Keeper -> Light Force at 2,500,000 DUST',
        emblem: 'K',
        signal: 'Vault Key',
        cardClass: 'border-[#49c7ff]/50 from-[#0b2f3e] via-[#071b2b] to-[#030912]',
        emblemClass: 'border-[#49c7ff]/60 bg-[#49c7ff]/20 text-[#9ee7ff]',
        glowClass: 'bg-[#49c7ff]/30'
      },
      {
        name: 'Light Force',
        range: '2,500,000+ DUST',
        benefit: '15%',
        goal: 'Light Force -> Max Level',
        emblem: 'LF',
        signal: 'Max Class',
        cardClass: 'border-[#da65ff]/50 from-[#351152] via-[#180828] to-[#07040c]',
        emblemClass: 'border-[#da65ff]/70 bg-[#da65ff]/20 text-[#f0b2ff]',
        glowClass: 'bg-[#da65ff]/30'
      }
    ] satisfies AccessLevel[]
  },
  tier: {
    label: '2. TIER',
    title: 'Monthly Status',
    subtitle: 'ระดับรายเดือน',
    description: [
      'TIER คือระดับรายเดือน',
      'คำนวณจาก DUST ที่สะสมภายในเดือนปัจจุบัน',
      'รีเซ็ตทุกเดือน'
    ],
    levels: [
      {
        name: 'Silver',
        range: '0 - 37,475 DUST',
        benefit: '0%',
        goal: 'Silver -> Gold at 37,500 DUST',
        emblem: 'S',
        signal: 'Month Start',
        cardClass: 'border-white/25 from-[#2a302d] via-[#171d19] to-[#070907]',
        emblemClass: 'border-white/40 bg-white/10 text-white',
        glowClass: 'bg-white/20'
      },
      {
        name: 'Gold',
        range: '37,500 - 124,975 DUST',
        benefit: '5%',
        goal: 'Gold -> Platinum at 125,000 DUST',
        emblem: 'G',
        signal: 'Gold Track',
        cardClass: 'border-[#ffdd37]/50 from-[#47380a] via-[#251b04] to-[#090701]',
        emblemClass: 'border-[#ffdd37]/70 bg-[#ffdd37]/20 text-[#ffe974]',
        glowClass: 'bg-[#ffdd37]/30'
      },
      {
        name: 'Platinum',
        range: '125,000 - 249,975 DUST',
        benefit: '10%',
        goal: 'Platinum -> Diamond at 250,000 DUST',
        emblem: 'P',
        signal: 'Power Tier',
        cardClass: 'border-[#b983ff]/50 from-[#311b57] via-[#180b30] to-[#090414]',
        emblemClass: 'border-[#b983ff]/70 bg-[#b983ff]/20 text-[#dfc2ff]',
        glowClass: 'bg-[#b983ff]/30'
      },
      {
        name: 'Diamond',
        range: '250,000+ DUST',
        benefit: '15%',
        goal: 'Diamond -> Max Monthly Level',
        emblem: 'D',
        signal: 'Max Month',
        cardClass: 'border-[#53d8ff]/60 from-[#0c3d55] via-[#062235] to-[#020b12]',
        emblemClass: 'border-[#53d8ff]/70 bg-[#53d8ff]/20 text-[#a9efff]',
        glowClass: 'bg-[#53d8ff]/30'
      }
    ] satisfies AccessLevel[]
  },
  leaderboard: [
    {
      title: 'Overall Ranking',
      text: 'จัดอันดับจาก DUST สะสมตลอดชีพ',
      accent: 'text-[#9ee7ff]'
    },
    {
      title: 'Monthly Ranking',
      text: 'จัดอันดับจาก DUST ภายในเดือนปัจจุบัน',
      accent: 'text-[#f0b2ff]'
    }
  ],
  steps: [
    { title: 'สมัครสมาชิก', code: '01' },
    { title: 'สะสม DUST จากการซื้อสินค้า', code: '02' },
    { title: 'ปลดล็อก CLASS และ TIER', code: '03' },
    { title: 'รับสิทธิพิเศษและร่วม Leaderboard', code: '04' }
  ]
};

export const metadata: Metadata = {
  title: 'WEED WALKER ACCESS | Member Levels',
  description: 'WEED WALKER member access levels, DUST goals, store privileges, and leaderboard.'
};

export default function AccessPage() {
  const allLevels = [...accessConfig.class.levels, ...accessConfig.tier.levels];

  return (
    <main className="access-stage min-h-screen overflow-hidden text-[#f4ffe7]">
      <div className="access-scanline" />

      <section className="walker-shell relative z-10 py-8 md:py-12">
        <header className="mx-auto mb-7 max-w-5xl text-center">
          <p className="mx-auto mb-4 inline-flex rounded-full border border-[#a7ff3f]/40 bg-black/60 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-[#b7ff57] shadow-[0_0_30px_rgba(167,255,63,0.18)]">
            WEED WALKER CRM / MEMBER SYSTEM
          </p>
          <h1 className="text-5xl font-black uppercase leading-[0.86] tracking-[-0.07em] text-white drop-shadow-[0_0_28px_rgba(167,255,63,0.2)] md:text-7xl">
            WEED WALKER <span className="text-[#a7ff3f]">ACCESS</span>
          </h1>
          <p className="mt-4 text-base font-black text-[#d8ff9f] md:text-xl">
            ระบบสมาชิก / Access Level / Leaderboard
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-bold leading-7 text-[#d9e8cb] md:text-base">
            สะสม DUST เพื่อปลดล็อกระดับ สิทธิพิเศษ และอันดับบน Leaderboard
          </p>
          <div className="mt-5 inline-flex rounded-full border border-[#a7ff3f]/50 bg-[#0b1607]/80 px-6 py-3 text-sm font-black text-[#f5ffbe] shadow-[0_0_40px_rgba(167,255,63,0.18)]">
            {accessConfig.conversionNotice}
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-2">
          <SystemBoard system={accessConfig.class} />
          <SystemBoard system={accessConfig.tier} />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="access-panel p-5 md:p-6">
            <PanelTitle kicker="3. BENEFITS" title="Benefits / Discounts" />
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <BenefitGrid title="CLASS benefits" levels={accessConfig.class.levels} />
              <BenefitGrid title="TIER benefits" levels={accessConfig.tier.levels} />
            </div>
            <p className="mt-5 rounded-2xl border border-[#a7ff3f]/25 bg-[#a7ff3f]/10 p-4 text-sm font-bold leading-6 text-[#d9e8cb]">
              สิทธิพิเศษอาจปรับเปลี่ยนตามกิจกรรม เงื่อนไข และประกาศของร้าน
            </p>
          </div>

          <div className="access-panel p-5 md:p-6">
            <PanelTitle kicker="4. HOW IT WORKS" title="Mechanics" />
            <div className="mt-5 grid gap-3">
              {accessConfig.steps.map((step) => (
                <div
                  key={step.code}
                  className="group grid grid-cols-[54px_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-white/10 bg-black/40 p-3 transition hover:border-[#a7ff3f]/50"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[#a7ff3f]/40 bg-[#a7ff3f]/10 font-black text-[#caff7a] shadow-[0_0_22px_rgba(167,255,63,0.12)]">
                    {step.code}
                  </span>
                  <span className="text-sm font-black leading-6 text-[#f4ffe7]">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <GoalPanel label="5. CLASS GOAL" title="Lifetime Unlocks" levels={accessConfig.class.levels} />
          <GoalPanel label="6. TIER GOAL" title="Monthly Unlocks" levels={accessConfig.tier.levels} />
        </section>

        <section className="access-panel mt-5 p-5 md:p-6">
          <PanelTitle kicker="7. LEADERBOARD" title="Ranking Arena" />
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {accessConfig.leaderboard.map((card) => (
              <article key={card.title} className="relative overflow-hidden rounded-3xl border border-[#a7ff3f]/25 bg-black/50 p-5">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#a7ff3f]/70 to-transparent" />
                <p className={`text-xs font-black uppercase tracking-[0.22em] ${card.accent}`}>{card.title}</p>
                <h3 className="mt-2 text-xl font-black text-white">{card.text}</h3>
                <Podium />
              </article>
            ))}
          </div>
          <p className="mt-5 text-sm font-bold leading-6 text-[#d9e8cb]">
            Top members may receive monthly rewards, campaign access, or special privileges depending on store announcement.
          </p>
        </section>

        <section className="mt-5 grid gap-3 md:grid-cols-4">
          {allLevels.slice(1, 5).map((level) => (
            <div key={level.goal} className="rounded-2xl border border-[#a7ff3f]/20 bg-black/40 p-4">
              <div className={`access-mini-emblem ${level.emblemClass}`}>
                <span>{level.emblem}</span>
              </div>
              <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-[#a7ff3f]">Next Unlock</p>
              <p className="mt-2 text-sm font-black leading-6 text-white">{level.goal}</p>
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}

function SystemBoard({
  system
}: {
  system: {
    label: string;
    title: string;
    subtitle: string;
    description: string[];
    levels: AccessLevel[];
  };
}) {
  return (
    <section className="access-panel p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PanelTitle kicker={system.label} title={system.title} subtitle={system.subtitle} />
        <div className="grid gap-2 text-sm font-bold leading-6 text-[#d9e8cb] md:max-w-[320px]">
          {system.description.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        {system.levels.map((level, index) => (
          <div key={level.name} className="relative">
            <LevelCard level={level} />
            {index < system.levels.length - 1 ? (
              <span className="pointer-events-none absolute right-[-15px] top-1/2 z-20 hidden h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-[#a7ff3f]/40 bg-[#0b1607] text-sm font-black text-[#a7ff3f] 2xl:grid">
                &gt;
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function LevelCard({ level }: { level: AccessLevel }) {
  return (
    <article className={`access-level-card bg-gradient-to-br ${level.cardClass}`}>
      <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${level.glowClass}`} />
      <div className={`access-emblem ${level.emblemClass}`}>
        <span>{level.emblem}</span>
      </div>
      <div className="relative z-10 mt-4">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#d9e8cb]/75">{level.signal}</p>
        <h3 className="mt-2 text-2xl font-black uppercase leading-none tracking-[-0.04em] text-white">{level.name}</h3>
        <p className="mt-3 min-h-12 text-sm font-black leading-6 text-[#f2ffd7]">{level.range}</p>
      </div>
      <div className="relative z-10 mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d9e8cb]/70">Benefit</span>
        <strong className="text-xl font-black text-[#a7ff3f]">{level.benefit}</strong>
      </div>
    </article>
  );
}

function BenefitGrid({ title, levels }: { title: string; levels: AccessLevel[] }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-black/40 p-4">
      <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[#a7ff3f]">{title}</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {levels.map((level) => (
          <div key={level.name} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <div className={`access-mini-emblem ${level.emblemClass}`}>
              <span>{level.emblem}</span>
            </div>
            <p className="mt-3 text-xs font-black text-white">{level.name}</p>
            <p className="mt-1 text-2xl font-black text-[#a7ff3f]">{level.benefit}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function GoalPanel({ label, title, levels }: { label: string; title: string; levels: AccessLevel[] }) {
  return (
    <section className="access-panel p-5 md:p-6">
      <PanelTitle kicker={label} title={title} />
      <div className="mt-5 grid gap-3">
        {levels.map((level) => (
          <div key={level.goal} className="grid grid-cols-[42px_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-white/10 bg-black/40 p-3">
            <div className={`access-mini-emblem ${level.emblemClass}`}>
              <span>{level.emblem}</span>
            </div>
            <div>
              <p className="text-sm font-black text-white">{level.name}</p>
              <p className="mt-1 text-xs font-bold leading-5 text-[#d9e8cb]">{level.goal}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Podium() {
  return (
    <div className="mt-7 grid grid-cols-3 items-end gap-3">
      <PodiumStep place="2" label="Top 2" height="h-20" />
      <PodiumStep place="1" label="Champion" height="h-32" active />
      <PodiumStep place="3" label="Top 3" height="h-16" />
    </div>
  );
}

function PodiumStep({ place, label, height, active = false }: { place: string; label: string; height: string; active?: boolean }) {
  return (
    <div className="grid justify-items-center gap-2">
      <div className={`access-podium-head ${active ? 'border-[#ffdd37]/70 bg-[#ffdd37]/20 text-[#ffef8a]' : 'border-white/25 bg-white/10 text-white'}`}>
        {place}
      </div>
      <div className={`w-full rounded-t-2xl border ${height} ${active ? 'border-[#ffdd37]/50 bg-gradient-to-t from-[#664600] to-[#ffdd37]/40' : 'border-[#a7ff3f]/20 bg-gradient-to-t from-[#0b1607] to-[#a7ff3f]/15'}`} />
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#d9e8cb]/80">{label}</p>
    </div>
  );
}

function PanelTitle({ kicker, title, subtitle }: { kicker: string; title: string; subtitle?: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#a7ff3f]">{kicker}</p>
      <h2 className="mt-2 text-2xl font-black uppercase leading-none tracking-[-0.04em] text-white md:text-3xl">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm font-black text-[#d8ff9f]">{subtitle}</p> : null}
    </div>
  );
}
