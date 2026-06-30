import { IntakeForm } from '@/components/intake-form';

export const metadata = {
  title: 'Intake Portal | WEED WALKER',
  description: 'WEED WALKER member registration and partner clinic coordination portal.',
};

export default function IntakePage() {
  return (
    <main className="walker-shell py-5 md:py-8">
      <section className="mb-6 overflow-hidden rounded-[2rem] border border-walkerYellow/15 bg-[#050505] shadow-[0_0_90px_rgba(0,0,0,0.65)]">
        <div className="grid min-h-[620px] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative z-10 flex flex-col justify-between gap-10 p-6 md:p-10 lg:p-12">
            <a href="/" className="flex items-center gap-4" aria-label="Back to WEED WALKER home">
              <span className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-walkerYellow/30 bg-black shadow-[0_0_42px_rgba(255,210,26,0.22)]">
                <img
                  src="/weed-walker-logo-mark.png"
                  alt="WEED WALKER logo"
                  className="h-14 w-14 object-contain"
                />
              </span>
              <span>
                <strong className="block text-xl font-black tracking-tight">WEED WALKER</strong>
                <small className="block text-xs font-black uppercase tracking-[0.22em] text-walkerYellow">
                  Master of Cannabis
                </small>
              </span>
            </a>

            <div>
              <p className="mb-5 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.28em] text-walkerYellow">
                <span className="h-px w-10 bg-walkerYellow/70" />
                Member Registration
                <span className="h-px w-10 bg-walkerYellow/70" />
              </p>
              <h1 className="max-w-2xl text-5xl font-black leading-[0.92] tracking-[-0.07em] text-[#f8f3dc] md:text-7xl lg:text-8xl">
                สมัครสมาชิก
                <span className="block">ของคุณ</span>
                <span className="block text-walkerYellow">
                  ทุกอย่างในที่
                  <span className="block">เดียว</span>
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[#d9d3bd] md:text-lg">
                ลงทะเบียน ยืนยันตัวตน เข้าถึงบริการจากคลินิกพาร์ทเนอร์ ติดตามสถานะ
                และดาวน์โหลดเอกสารของคุณได้อย่างปลอดภัย
              </p>
            </div>
          </div>

          <div className="relative min-h-[420px] overflow-hidden lg:min-h-full">
            <img
              src="/weedwalker-hero-bg.jpg"
              alt="WEED WALKER sci-fi portal artwork"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/45 to-transparent lg:from-[#050505]/70" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />

            <aside className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/12 bg-black/55 p-5 shadow-[0_0_50px_rgba(0,0,0,0.55)] backdrop-blur-md md:left-auto md:right-8 md:w-[360px]">
              <div className="flex gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-walkerYellow/35 bg-walkerYellow/10 text-2xl text-walkerYellow">
                  ◇
                </span>
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-walkerYellow">Your Privacy</p>
                  <p className="mt-2 text-sm leading-7 text-[#d9d3bd]">
                    ข้อมูลของคุณจะถูกใช้เฉพาะเพื่อการยืนยันตัวตน การจัดการสมาชิก
                    และการประสานงานกับคลินิกพาร์ทเนอร์เท่าที่จำเป็น โดย WEED WALKER
                    ไม่ได้เป็นผู้ให้บริการทางการแพทย์
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl">
        <IntakeForm />
      </div>
    </main>
  );
}
