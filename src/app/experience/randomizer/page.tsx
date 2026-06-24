'use client';

import { useState } from 'react';

type Result = {
  name: string;
  vibe: string;
  method: string;
};

export default function RandomizerPage() {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const randomPromoEnabled = process.env.NEXT_PUBLIC_ENABLE_RANDOM_PROMO === 'true';

  async function roll() {
    setLoading(true);
    const response = await fetch('/api/entertainment/strain-randomizer', { method: 'POST' });
    const body = await response.json();
    setResult(body.result);
    setLoading(false);
  }

  if (!randomPromoEnabled) {
    return (
      <main className="walker-shell grid min-h-[78vh] items-center pb-16 pt-8">
        <section className="walker-card p-6 md:p-10">
          <p className="mb-4 inline-flex rounded-full border border-walkerYellow/30 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-walkerYellow">
            Optional Promo
          </p>
          <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.06em] md:text-7xl">
            Random promo is disabled.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#d9d3bd]">
            This feature is not part of the core WEED WALKER website. First launch focuses on Intake Portal, Access Level, and Flight Menu.
          </p>
          <a className="walker-btn walker-btn-primary mt-8" href="/">
            Back to Home
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="walker-shell grid min-h-[78vh] items-center pb-16 pt-8">
      <section className="walker-card p-6 md:p-10">
        <p className="mb-4 inline-flex rounded-full border border-walkerYellow/30 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-walkerYellow">
          Entertainment Feature
        </p>
        <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.06em] md:text-8xl">
          Strain Randomizer
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#d9d3bd]">
          เล่นกับ mood และ cultivation style เพื่อเปิดบทสนทนากับ budtender และสร้าง engagement ให้สมาชิก
        </p>
        <button onClick={roll} disabled={loading} className="walker-btn walker-btn-primary mt-8">
          {loading ? 'Rolling...' : 'Roll Experience'}
        </button>

        {result ? (
          <div className="mt-8 rounded-3xl border border-walkerYellow/20 bg-walkerYellow/10 p-6">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-walkerYellow">Your pull</p>
            <h2 className="mt-2 text-4xl font-black tracking-tight">{result.name}</h2>
            <p className="mt-3 text-lg text-[#f3e9bb]">{result.vibe}</p>
            <p className="mt-2 walker-muted">Cultivation mood: {result.method}</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
