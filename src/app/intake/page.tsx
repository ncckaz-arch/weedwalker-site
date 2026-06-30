import { IntakeForm } from '@/components/intake-form';

export const metadata = {
  title: 'Intake Portal | WEED WALKER',
  description: 'WEED WALKER member registration and partner clinic coordination portal.'
};

export default function IntakePage() {
  return (
    <main className="walker-shell py-4 md:py-6">
      <section className="mb-4 overflow-hidden rounded-[1.75rem] border border-walkerYellow/15 bg-[#050505] shadow-[0_0_70px_rgba(0,0,0,0.55)]">
        <div className="grid lg:min-h-[380px] lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="relative z-10 flex flex-col gap-6 p-5 md:p-8 lg:p-9">
            <a href="/" className="flex items-center gap-4" aria-label="Back to WEED WALKER home">
              <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl border border-walkerYellow/30 bg-black shadow-[0_0_32px_rgba(255,210,26,0.18)]">
                <img
                  src="/weed-walker-logo-mark.png"
                  alt="WEED WALKER logo"
                  className="h-10 w-10 object-contain"
                />
              </span>
              <span>
                <strong className="block text-base font-black tracking-tight">WEED WALKER</strong>
                <small className="block text-[0.68rem] font-black uppercase tracking-[0.22em] text-walkerYellow">
                  Master of Cannabis
                </small>
              </span>
            </a>

            <div className="max-w-3xl">
              <p className="mb-4 inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.26em] text-walkerYellow">
                <span className="h-px w-8 bg-walkerYellow/70" />
                MEMBER REGISTRATION
              </p>

              <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.055em] text-[#f8f3dc] md:text-5xl lg:text-6xl">
                สมัครสมาชิก
                <span className="block text-walkerYellow">Medical Intake</span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#d9d3bd] md:text-base">
                Register for the WEED WALKER member program and begin the medical intake process with our partner clinic.
              </p>

              <div className="mt-5 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <div className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-walkerYellow/35 bg-walkerYellow/10 text-lg text-walkerYellow">
                    ◇
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-walkerYellow">Your Privacy</p>
                    <p className="mt-1 text-xs leading-6 text-[#c9c1aa] md:text-sm">
                      ข้อมูลของคุณใช้เพื่อยืนยันตัวตน จัดการสมาชิก และประสานงานกับคลินิกพาร์ทเนอร์เท่าที่จำเป็น โดย WEED WALKER ไม่ได้เป็นผู้ให้บริการทางการแพทย์
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative min-h-[180px] overflow-hidden border-t border-white/5 lg:min-h-full lg:border-l lg:border-t-0 lg:border-white/5">
            <img
              src="/weedwalker-hero-bg.jpg"
              alt="WEED WALKER sci-fi portal artwork"
              className="absolute inset-0 h-full w-full object-cover opacity-65"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/45 to-transparent lg:from-[#050505]/35" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl">
        <IntakeForm />
      </div>
    </main>
  );
}
