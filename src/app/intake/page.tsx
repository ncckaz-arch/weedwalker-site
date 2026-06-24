import { IntakeForm } from '@/components/intake-form';

export default function IntakePage() {
  return (
    <main className="walker-shell pb-16 pt-8">
      <section className="mb-8">
        <p className="mb-4 inline-flex rounded-full border border-walkerYellow/30 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-walkerYellow">
          WEED WALKER Intake Portal
        </p>
        <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.06em] md:text-7xl">
          Start Intake. No login required.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#d9d3bd]">
          ลูกค้าใหม่สามารถส่งข้อมูล intake อัปโหลดเอกสาร ยืนยัน consent
          และส่งคำขอ telemed flow ได้ทันที ส่วน Google Verify จะใช้ภายหลังสำหรับ Member Interface
        </p>
      </section>
      <IntakeForm />
    </main>
  );
}
