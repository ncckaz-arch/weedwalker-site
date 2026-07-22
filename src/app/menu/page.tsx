'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

type CategoryKey = 'all' | 'craft' | 'smooth-coco-line' | 'precision-hydro' | 'living-soil';
type LineCategory = Exclude<CategoryKey, 'all'>;
type ProductType = 'indica' | 'sativa' | 'hybrid' | 'indica-dominant' | 'sativa-dominant';

type MenuItem = {
  id: string;
  name: string;
  category: LineCategory;
  type: ProductType;
  thc: string;
  price: string;
  flavors: string[];
  effects: string[];
};

const categories: Array<{
  key: CategoryKey;
  label: string;
  cardLabel?: string;
  line?: string;
  color: string;
  textColor: string;
}> = [
  { key: 'all', label: 'All Lines', color: '#f4c430', textColor: '#141200' },
  {
    key: 'craft',
    label: 'Craft Cultivation',
    cardLabel: 'Craft Cultivation',
    line: 'Craft Cultivation',
    color: '#f5b642',
    textColor: '#130900'
  },
  {
    key: 'smooth-coco-line',
    label: 'Smooth Coco Line',
    cardLabel: 'Smooth Coco Line',
    line: 'Sungrown Hybrid',
    color: '#9d35ff',
    textColor: '#120018'
  },
  {
    key: 'precision-hydro',
    label: 'Precise Line',
    cardLabel: 'Hydroponics Rockwool',
    line: 'Precision Hydro',
    color: '#1787ff',
    textColor: '#020b18'
  },
  {
    key: 'living-soil',
    label: 'Living Soil',
    cardLabel: 'Living Soil',
    line: 'Living Soil',
    color: '#19d642',
    textColor: '#031006'
  }
];

const lineCategories = categories.filter(
  (category): category is (typeof categories)[number] & { key: LineCategory } => category.key !== 'all'
);

const productTypes: Record<ProductType, string> = {
  indica: 'Indica',
  sativa: 'Sativa',
  hybrid: 'Hybrid',
  'indica-dominant': 'Indica Hybrid',
  'sativa-dominant': 'Sativa Hybrid'
};

const productTypeStyles: Record<ProductType, { borderColor: string; color: string; backgroundColor: string }> = {
  indica: {
    borderColor: '#9d35ff',
    color: '#b76cff',
    backgroundColor: 'rgba(157,53,255,0.1)'
  },
  sativa: {
    borderColor: '#72d56b',
    color: '#72d56b',
    backgroundColor: 'rgba(114,213,107,0.08)'
  },
  hybrid: {
    borderColor: '#f5c866',
    color: '#f5c866',
    backgroundColor: 'rgba(245,198,102,0.1)'
  },
  'indica-dominant': {
    borderColor: '#b76cff',
    color: '#c98cff',
    backgroundColor: 'rgba(157,53,255,0.1)'
  },
  'sativa-dominant': {
    borderColor: '#72d56b',
    color: '#8fe889',
    backgroundColor: 'rgba(114,213,107,0.08)'
  }
};

const menuItems: MenuItem[] = [
  {
    id: 'craft-white-truffle',
    name: 'White Truffle',
    category: 'craft',
    type: 'indica',
    thc: '22.4%',
    price: '250฿',
    flavors: ['Earthy', 'Nutty', 'Truffle'],
    effects: ['Relaxed', 'Happy', 'Sleepy']
  },
  {
    id: 'craft-gelato47',
    name: 'Gelato47',
    category: 'craft',
    type: 'indica',
    thc: '26.5%',
    price: '250฿',
    flavors: ['Sweet', 'Creamy', 'Berry'],
    effects: ['Euphoric', 'Relaxed', 'Uplifted']
  },
  {
    id: 'craft-frosty-banana',
    name: 'Frosty Banana',
    category: 'craft',
    type: 'indica',
    thc: '24%',
    price: '250฿',
    flavors: ['Banana', 'Frosty', 'Cream'],
    effects: ['Calm', 'Happy', 'Heavy']
  },
  {
    id: 'craft-nova-gas',
    name: 'Nova Gas',
    category: 'craft',
    type: 'indica',
    thc: '23%',
    price: '250฿',
    flavors: ['Gas', 'Spice', 'Earth'],
    effects: ['Relaxed', 'Mellow', 'Sleepy']
  },
  {
    id: 'smooth-gruntz',
    name: 'Gruntz',
    category: 'smooth-coco-line',
    type: 'indica',
    thc: '21-24%',
    price: '300฿',
    flavors: ['Candy', 'Grape', 'Gas'],
    effects: ['Happy', 'Relaxed', 'Mellow']
  },
  {
    id: 'smooth-hellfire-og',
    name: 'Hellfire OG',
    category: 'smooth-coco-line',
    type: 'indica',
    thc: '21-24%',
    price: '300฿',
    flavors: ['OG', 'Pine', 'Diesel'],
    effects: ['Heavy', 'Calm', 'Sleepy']
  },
  {
    id: 'smooth-bonanza',
    name: 'Bonanza',
    category: 'smooth-coco-line',
    type: 'indica',
    thc: '22%',
    price: '350฿',
    flavors: ['Sweet', 'Herbal', 'Cream'],
    effects: ['Relaxed', 'Happy', 'Balanced']
  },
  {
    id: 'smooth-rainbow-runtz',
    name: 'Rainbow Runtz',
    category: 'smooth-coco-line',
    type: 'indica',
    thc: '26%',
    price: '350฿',
    flavors: ['Tropical', 'Candy', 'Berry'],
    effects: ['Uplifted', 'Social', 'Relaxed']
  },
  {
    id: 'smooth-mochi-gelato',
    name: 'Mochi Gelato',
    category: 'smooth-coco-line',
    type: 'indica',
    thc: '24%',
    price: '350฿',
    flavors: ['Creamy', 'Dessert', 'Berry'],
    effects: ['Euphoric', 'Calm', 'Happy']
  },
  {
    id: 'smooth-purple-punch',
    name: 'Purple Punch x Purple Punch',
    category: 'smooth-coco-line',
    type: 'indica',
    thc: '22%',
    price: '350฿',
    flavors: ['Grape', 'Berry', 'Vanilla'],
    effects: ['Sleepy', 'Relaxed', 'Cozy']
  },
  {
    id: 'smooth-ice-cream-cake',
    name: 'Ice Cream Cake',
    category: 'smooth-coco-line',
    type: 'indica',
    thc: '23%',
    price: '350฿',
    flavors: ['Vanilla', 'Cream', 'Sweet'],
    effects: ['Relaxed', 'Happy', 'Sleepy']
  },
  {
    id: 'smooth-candy-pave',
    name: 'Candy Pave',
    category: 'smooth-coco-line',
    type: 'indica',
    thc: '21-24%',
    price: '350฿',
    flavors: ['Candy', 'Gas', 'Sweet'],
    effects: ['Euphoric', 'Creative', 'Relaxed']
  },
  {
    id: 'hydro-nuke',
    name: 'Nuke',
    category: 'precision-hydro',
    type: 'sativa-dominant',
    thc: '24%',
    price: '350฿',
    flavors: ['Gas', 'Earth', 'Spice'],
    effects: ['Strong', 'Relaxed', 'Heavy']
  },
  {
    id: 'hydro-compound-z',
    name: 'Compound Z',
    category: 'precision-hydro',
    type: 'hybrid',
    thc: '23%',
    price: '350฿',
    flavors: ['Candy', 'Gas', 'Fruit'],
    effects: ['Uplifted', 'Relaxed', 'Happy']
  },
  {
    id: 'hydro-blueberry-muffins',
    name: 'Blueberry Muffins',
    category: 'precision-hydro',
    type: 'indica-dominant',
    thc: '21%',
    price: '350฿',
    flavors: ['Blueberry', 'Bakery', 'Sweet'],
    effects: ['Calm', 'Happy', 'Balanced']
  },
  {
    id: 'hydro-biscotti-og',
    name: 'Biscotti OG',
    category: 'precision-hydro',
    type: 'indica-dominant',
    thc: '27%',
    price: '350฿',
    flavors: ['Pepper', 'Citrus', 'Earthy'],
    effects: ['Creative', 'Happy', 'Euphoria']
  },
  {
    id: 'hydro-boofscotti',
    name: 'Boofscotti',
    category: 'precision-hydro',
    type: 'hybrid',
    thc: '36.97%',
    price: '350฿',
    flavors: ['Citrus', 'Floral', 'Spicy'],
    effects: ['Relaxed', 'Euphoria', 'Creative']
  },
  {
    id: 'hydro-platinum-pave',
    name: 'Platinum Pave',
    category: 'precision-hydro',
    type: 'indica-dominant',
    thc: '27%',
    price: '350฿',
    flavors: ['Citrus', 'Floral', 'Pine'],
    effects: ['Euphoria', 'Happy', 'Relaxed']
  },
  {
    id: 'hydro-prize',
    name: 'Prize',
    category: 'precision-hydro',
    type: 'sativa-dominant',
    thc: '33.51%',
    price: '350฿',
    flavors: ['Earthy', 'Pungent', 'Diesel'],
    effects: ['Relaxed', 'Euphoric', 'Happy']
  },
  {
    id: 'hydro-peach',
    name: 'Peach',
    category: 'precision-hydro',
    type: 'indica-dominant',
    thc: '30.12%',
    price: '350฿',
    flavors: ['Fruity', 'Sweet', 'Vanilla'],
    effects: ['Body High', 'Euphoria', 'Relaxing']
  },
  {
    id: 'hydro-apple-banana',
    name: 'Apple Banana',
    category: 'precision-hydro',
    type: 'hybrid',
    thc: '28.00%',
    price: '350฿',
    flavors: ['Sweet', 'Fruity', 'Citrus'],
    effects: ['Relaxed', 'Talkative', 'Focused']
  },
  {
    id: 'hydro-rd-limao',
    name: 'RD Limao',
    category: 'precision-hydro',
    type: 'sativa',
    thc: '16.8%',
    price: '350฿',
    flavors: ['Fruity', 'Orange', 'Lemon'],
    effects: ['Uplifting', 'Focused', 'Happy']
  },
  {
    id: 'hydro-gelato-lisbon',
    name: 'Gelato Lisbon',
    category: 'precision-hydro',
    type: 'hybrid',
    thc: '23.88%',
    price: '350฿',
    flavors: ['Spicy', 'Sweet', 'Berry'],
    effects: ['Euphoria', 'Uplifting', 'Focus']
  },
  {
    id: 'soil-caribbean-breeze',
    name: 'Caribbean Breeze',
    category: 'living-soil',
    type: 'sativa',
    thc: '25.9%',
    price: '800฿',
    flavors: ['Tropical', 'Citrus', 'Herbal'],
    effects: ['Energetic', 'Focused', 'Creative']
  },
  {
    id: 'soil-magic-pop-rock',
    name: 'Magic Pop Rock',
    category: 'living-soil',
    type: 'sativa',
    thc: '27%',
    price: '800฿',
    flavors: ['Candy', 'Citrus', 'Sparkle'],
    effects: ['Uplifted', 'Creative', 'Bright']
  }
];

function categoryMeta(key: LineCategory) {
  return categories.find((category) => category.key === key)!;
}

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [sheetItems, setSheetItems] = useState<MenuItem[]>(menuItems);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/menu', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { items?: MenuItem[] } | null) => {
        if (!isMounted || !data?.items?.length) return;
        setSheetItems(data.items);
      })
      .catch(() => {
        // Keep the built-in menu data when the Sheet is unavailable.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return sheetItems;
    return sheetItems.filter((item) => item.category === activeCategory);
  }, [activeCategory, sheetItems]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050504] pb-8 text-[#f5f2e7] [background-image:radial-gradient(circle_at_15%_0%,rgba(244,196,48,0.08),transparent_38%),radial-gradient(circle_at_92%_23%,rgba(244,196,48,0.12),transparent_24%),linear-gradient(180deg,#050504_0%,#0a0a08_42%,#050504_100%)]">
      <header className="sticky top-0 z-40 border-b border-[#2a2818] bg-black/90 px-4 py-5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4">
          <a href="/" className="flex min-w-0 items-center gap-3" aria-label="WEED WALKER Home">
            <span className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl bg-[linear-gradient(150deg,#ffe16a,#d99b19)] text-xl font-black text-[#141200] shadow-[0_0_22px_rgba(245,182,66,0.45)]">
              WW
            </span>
            <span className="truncate text-3xl font-black uppercase tracking-[-0.04em] text-white sm:text-4xl">
              WEED <span className="text-[#f5b642]">WALKER</span>
            </span>
          </a>
          <span className="inline-flex min-h-12 shrink-0 items-center gap-3 rounded-2xl border border-[#8a6728] px-5 text-sm font-black uppercase tracking-[0.22em] text-[#f5c866]">
            <MenuIcon />
            Menu
          </span>
        </div>
      </header>

      <nav className="border-b border-[#1b1a14] bg-[#080806]/88 px-4 py-4 backdrop-blur" aria-label="Cultivation lines">
        <div className="mx-auto flex max-w-[1280px] gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {lineCategories.map((category) => {
            const isActive = activeCategory === category.key;
            return (
              <button
                key={category.key}
                type="button"
                onClick={() => setActiveCategory(isActive ? 'all' : category.key)}
                className={`flex min-h-14 shrink-0 items-center gap-3 rounded-full border px-5 text-base font-bold transition active:scale-95 ${
                  isActive ? 'shadow-[0_0_24px_rgba(245,182,66,0.22)]' : ''
                }`}
                style={
                  isActive
                    ? {
                        borderColor: category.color,
                        color: category.color,
                        backgroundColor: `${category.color}18`
                      }
                    : { borderColor: '#2a2818', color: '#8c8874', backgroundColor: '#10100d' }
                }
              >
                <span
                  className="h-4 w-4 rounded-full shadow-[0_0_14px_currentColor]"
                  style={{ backgroundColor: category.color, color: category.color }}
                />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <section className="mx-auto max-w-[1280px] px-4 pt-6 md:px-6 xl:px-8">
        <div className="relative mb-5 overflow-hidden rounded-[1.25rem] border border-[#2a2818]/70 bg-[#0b0b08]/75 p-4">
          <div className="absolute -right-20 top-0 h-48 w-48 rounded-full border border-[#f5b642]/35 opacity-50 shadow-[0_0_55px_rgba(245,182,66,0.25)]" />
          <p className="relative text-[11px] font-black uppercase tracking-[0.45em] text-[#f5c866]">
            Today&apos;s Lineup
          </p>
          <h1 className="relative mt-2 text-[clamp(2.15rem,6vw,3.25rem)] font-black uppercase leading-none tracking-[-0.055em] text-white">
            WEED WALKER MENU
          </h1>
          <p className="relative mt-2 font-mono text-base font-black text-[#8c8874]">{filteredItems.length} strains</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <ProductCard key={item.id} item={item} onOpen={() => setSelectedItem(item)} />
          ))}
        </div>

        <p className="mt-6 flex items-center justify-center gap-4 text-center text-[11px] font-black uppercase tracking-[0.32em] text-[#b28a42]">
          <span className="text-[#f5c866]">✦</span>
          Premium flowers. Curated with purpose.
          <span className="text-[#f5c866]">✦</span>
        </p>
      </section>

      {selectedItem ? (
        <ProductSheet item={selectedItem} onClose={() => setSelectedItem(null)} />
      ) : null}
    </main>
  );
}

function ProductCard({ item, onOpen }: { item: MenuItem; onOpen: () => void }) {
  const category = categoryMeta(item.category);
  const typeStyle = productTypeStyles[item.type];

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative flex min-h-[330px] w-full flex-col overflow-hidden rounded-[1rem] border border-[#5a4223] bg-[radial-gradient(circle_at_16%_10%,rgba(245,182,66,0.12),transparent_11rem),linear-gradient(145deg,rgba(23,22,17,0.96),rgba(6,6,5,0.98))] p-4 text-left text-[#f5f2e7] shadow-[0_0_28px_rgba(0,0,0,0.36)] transition active:scale-[0.992]"
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full opacity-10 blur-2xl"
        style={{ backgroundColor: category.color }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <GlowOrb color={category.color} />
        <span className="rounded-full border border-[#f5c866] px-4 py-2 font-mono text-base font-black text-[#f5c866] shadow-[0_0_14px_rgba(245,198,102,0.12)]">
          {item.price}
        </span>
      </div>

      <div className="relative mt-4 min-w-0">
        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: category.color }}>
          <LeafIcon />
          {category.cardLabel ?? category.label}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span
            className="inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em]"
            style={typeStyle}
          >
            {productTypes[item.type]}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8c8874]">
            {category.line}
          </span>
        </div>

        <h2 className="mt-3 min-h-[58px] text-[clamp(1.55rem,4.2vw,2rem)] font-black leading-[0.98] tracking-[-0.05em] text-white">
          {item.name}
        </h2>
      </div>

      <div className="relative mt-auto">
        <div className="my-3 border-t border-dashed border-[#3a301e]" />
        <div className="flex items-end justify-between gap-3">
          <span>
            <span className="block font-mono text-[10px] font-black uppercase tracking-[0.12em] text-[#8c8874]">
              THC
            </span>
            <span className="mt-1 block font-mono text-[1.7rem] font-black leading-none tracking-[0.04em] text-[#f5c866]">
              {item.thc}
            </span>
          </span>
          <span
            className="h-3 w-3 rounded-full shadow-[0_0_12px_currentColor]"
            style={{ backgroundColor: category.color, color: category.color }}
          />
        </div>

        <div className="mt-4 grid gap-3">
          <DetailBlock icon={<FlavorIcon />} label="Flavor" values={item.flavors} />
          <DetailBlock icon={<EffectIcon />} label="Effects" values={item.effects} />
        </div>
      </div>
    </button>
  );
}

function ProductSheet({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const category = categoryMeta(item.category);
  const typeStyle = productTypeStyles[item.type];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#050504]/70 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <section
        className="max-h-[88vh] w-full max-w-[520px] overflow-y-auto rounded-t-[24px] border border-b-0 border-[#5a4223] bg-[#11100d] sm:rounded-[24px] sm:border"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="sticky right-3 top-3 z-10 ml-auto mr-3 grid h-9 w-9 place-items-center rounded-full border border-[#5a4223] bg-[#0a0a08]/80 text-[#f5f2e7]"
          aria-label="Close item details"
        >
          x
        </button>
        <div className="px-5 pb-7 pt-2">
          <GlowOrb color={category.color} compact />
          <p className="mt-4 flex items-center gap-3 text-xs font-black uppercase tracking-[0.22em]" style={{ color: category.color }}>
            <LeafIcon />
            {category.cardLabel ?? category.label}
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.06em] text-white">{item.name}</h2>
          <p className="mt-2 text-sm font-black uppercase" style={{ color: typeStyle.color }}>
            {productTypes[item.type]}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <StatBox label="THC" value={item.thc} />
            <StatBox label="Price" value={item.price} />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <DetailBlock icon={<FlavorIcon />} label="Flavor" values={item.flavors} />
            <DetailBlock icon={<EffectIcon />} label="Effects" values={item.effects} />
          </div>
        </div>
      </section>
    </div>
  );
}

function GlowOrb({ color, compact = false }: { color: string; compact?: boolean }) {
  return (
    <span
      className={`relative block shrink-0 rounded-full border shadow-[0_0_28px_currentColor] ${
        compact ? 'h-16 w-16' : 'h-16 w-16 sm:h-[74px] sm:w-[74px]'
      }`}
      style={{ borderColor: color, color, backgroundColor: 'rgba(0,0,0,0.35)' }}
    >
      <span
        className="absolute inset-2 rounded-full opacity-25 blur-md"
        style={{ backgroundColor: color }}
      />
      <span className="absolute inset-[22%] rounded-full bg-[#070706]" />
    </span>
  );
}

function DetailBlock({ icon, label, values }: { icon: ReactNode; label: string; values: string[] }) {
  return (
    <div className="grid grid-cols-[36px_minmax(0,1fr)] gap-2.5">
      <span className="grid h-9 w-9 place-items-center text-[#f5c866]">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[10px] font-black uppercase tracking-[0.08em] text-[#8c8874]">{label}</span>
        <span className="mt-0.5 block text-sm leading-5 text-[#f0eadb]">
          {values.map((value, index) => (
            <span key={value}>
              {index > 0 ? <span className="px-2 text-[#f5c866]">•</span> : null}
              {value}
            </span>
          ))}
        </span>
      </span>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-[#5a4223] bg-[#0b0b08] px-3 py-2.5">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-[#8c8874]">{label}</p>
      <p className="mt-1 font-mono text-xl font-black text-[#f5c866]">{value}</p>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20V9" />
      <path d="M12 13C7.5 12.5 5.1 9.2 4.7 5.2c4 .4 7.2 2.9 7.3 7.8Z" />
      <path d="M12 13c4.5-.5 6.9-3.8 7.3-7.8-4 .4-7.2 2.9-7.3 7.8Z" />
    </svg>
  );
}

function FlavorIcon() {
  return (
    <svg aria-hidden="true" className="h-8 w-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="17" r="5" />
      <circle cx="17" cy="12" r="5" />
      <circle cx="21" cy="19" r="5" />
      <path d="M10 17h.01M17 12h.01M21 19h.01" />
    </svg>
  );
}

function EffectIcon() {
  return (
    <svg aria-hidden="true" className="h-8 w-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 11c4-3 8-3 12 0s8 3 10 0" />
      <path d="M5 16c4-3 8-3 12 0s8 3 10 0" />
      <path d="M5 21c4-3 8-3 12 0s8 3 10 0" />
    </svg>
  );
}
