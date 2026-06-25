const intakeUrl =
  process.env.APPS_SCRIPT_INTAKE_URL ||
  'https://script.google.com/macros/s/AKfycbxnNoOPUHL5Wtn98x4N2baPjVCQznJ7ioYtZNtoksiU7MHVv-VKgc0U4y69Jdvh1cuK/exec';

export const metadata = {
  title: 'Intake Portal | WEED WALKER',
  description: 'WEED WALKER Intake Portal powered by the existing Apps Script intake system.',
};

export default function IntakePage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="border-b border-walkerYellow/20 bg-[radial-gradient(circle_at_top_left,rgba(245,197,24,0.18),transparent_34%),linear-gradient(135deg,#050505,#10100b_55%,#050505)] px-4 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.26em] text-walkerYellow">
              WEED WALKER · Intake Portal
            </p>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em] md:text-5xl">
              Access Within
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#d9d3bd] md:text-base">
              ใช้ Intake เดิมของ WEED WALKER สำหรับข้อมูลสมาชิก ความยินยอม เอกสารยืนยันตัวตน และคำขอ Telemed
            </p>
          </div>

          <a
            href={intakeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-walkerYellow/40 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-walkerYellow transition hover:border-walkerYellow hover:bg-walkerYellow hover:text-black"
          >
            Open Intake Directly
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="overflow-hidden rounded-[28px] border border-walkerYellow/20 bg-black shadow-[0_0_60px_rgba(245,197,24,0.12)]">
          <iframe
            title="WEED WALKER Intake"
            src={intakeUrl}
            className="h-[calc(100vh-190px)] min-h-[720px] w-full bg-white"
            loading="eager"
            referrerPolicy="origin"
            allow="camera; clipboard-read; clipboard-write; fullscreen"
          />
        </div>

        <p className="mt-4 text-center text-xs leading-5 text-walkerMuted">
          ถ้าฟอร์มไม่แสดง แปลว่า Apps Script ยังไม่ได้เปิด XFrameOptionsMode.ALLOWALL ให้กด Open Intake Directly ชั่วคราว
        </p>
      </section>
    </main>
  );
}
