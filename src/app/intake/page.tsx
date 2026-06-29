import { IntakeForm } from '@/components/intake-form';

export const metadata = {
  title: 'Intake Portal | WEED WALKER',
  description: 'WEED WALKER intake and licensed partner clinic referral portal.',
};

export default function IntakePage() {
  return (
    <main className="walker-shell py-5 md:py-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-3" aria-label="Back to WEED WALKER home">
          <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-walkerYellow/30 bg-black shadow-[0_0_32px_rgba(255,210,26,0.18)]">
            <img
              src="/weed-walker-logo-mark.png"
              alt="WEED WALKER logo"
              className="h-12 w-12 object-contain"
            />
          </span>
          <span>
            <strong className="block text-base tracking-tight">WEED WALKER</strong>
            <small className="walker-muted text-xs uppercase tracking-[0.2em]">Master of Cannabis</small>
          </span>
        </a>
        <span className="hidden rounded-full border border-walkerYellow/25 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-walkerYellow md:inline-flex">
          Intake Portal
        </span>
      </div>

      <section className="walker-card mb-6 overflow-hidden p-5 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1.5fr_0.8fr] md:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-walkerYellow/25 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-walkerYellow">
              Science to Soul
            </p>
            <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-[-0.08em] md:text-7xl">
              Member Registration
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#d9d3bd]">
              ลงทะเบียน ยืนยันข้อมูล ให้ความยินยอม และส่งข้อมูลเพื่อให้ WEED WALKER
              ประสานงานกับคลินิกพาร์ทเนอร์ที่ได้รับอนุญาต โดยไม่ต้อง Login Google ในขั้นตอนแรก
            </p>
          </div>

          <aside className="rounded-3xl border border-walkerYellow/20 bg-walkerYellow/5 p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-walkerYellow">Referral Intake</p>
            <p className="mt-3 text-sm leading-7 text-walkerMuted">
              WEED WALKER ทำหน้าที่เก็บข้อมูลที่จำเป็นและส่งต่อให้คลินิกพาร์ทเนอร์เป็นผู้ติดต่อและประเมินตามกฎหมาย
            </p>
          </aside>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="min-w-0">
          <IntakeForm />
        </div>

        <MemberServiceSidebar />
      </div>
    </main>
  );
}

function MemberServiceSidebar() {
  return (
    <aside className="walker-card p-5 lg:sticky lg:top-24">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-black uppercase tracking-[0.08em] text-walkerYellow">
          Member Service
        </h2>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-walkerMuted">
          Service
        </span>
      </div>

      <div className="overflow-hidden rounded-3xl border border-walkerYellow/20 bg-black/30">
        <a
          href="/member"
          className="group flex items-center gap-4 border-b border-white/10 p-4 transition hover:bg-walkerYellow/5"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-walkerYellow/10 text-walkerYellow">
            ◎
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block text-sm font-black uppercase tracking-[0.08em] text-walkerYellow">
              Application Status
            </strong>
            <small className="walker-muted mt-1 block text-xs leading-5">เข้าสู่ระบบด้วย Google</small>
          </span>
          <span className="text-2xl leading-none text-walkerYellow transition group-hover:translate-x-1">›</span>
        </a>

        <a
          href="/privacy-policy"
          className="group flex items-center gap-4 border-b border-white/10 p-4 transition hover:bg-walkerYellow/5"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-walkerYellow/10 text-walkerYellow">
            ◇
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block text-sm font-black uppercase tracking-[0.08em] text-walkerYellow">
              PDPA Rights Request
            </strong>
            <small className="walker-muted mt-1 block text-xs leading-5">
              ขอเข้าถึง แก้ไข ลบ หรือถอนความยินยอม
            </small>
          </span>
          <span className="text-2xl leading-none text-walkerYellow transition group-hover:translate-x-1">›</span>
        </a>

        <a
          href="https://lin.ee/yNXeTBs"
          className="group flex items-center gap-4 p-4 transition hover:bg-walkerYellow/5"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-walkerYellow/10 text-walkerYellow">
            ✦
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block text-sm font-black uppercase tracking-[0.08em] text-walkerYellow">
              Contact Support
            </strong>
            <small className="walker-muted mt-1 block text-xs leading-5">อีเมล LINE OA และเบอร์โทรติดต่อทีม</small>
          </span>
          <span className="text-2xl leading-none text-walkerYellow transition group-hover:translate-x-1">›</span>
        </a>
      </div>
    </aside>
  );
}
