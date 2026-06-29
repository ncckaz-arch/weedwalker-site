import { IntakeForm } from '@/components/intake-form';

export const metadata = {
  title: 'Intake Portal | WEED WALKER',
  description: 'WEED WALKER member intake and telemed request portal.',
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
              ลงทะเบียน ยืนยันข้อมูล ให้ความยินยอม และส่งคำขอ Telemed กับ WEED WALKER
              บนโดเมนของเราโดยตรง ไม่ต้อง Login Google ในขั้นตอนแรก
            </p>
          </div>

          <aside className="rounded-3xl border border-walkerYellow/20 bg-walkerYellow/5 p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-walkerYellow">Secure Flow</p>
            <p className="mt-3 text-sm leading-7 text-walkerMuted">
              ข้อมูลจะถูกบันทึกลงระบบของ WEED WALKER เพื่อใช้ประสานงานสมาชิกและคลินิกพาร์ทเนอร์เท่าที่จำเป็น
            </p>
          </aside>
        </div>
      </section>

      <IntakeForm />
    </main>
  );
}
