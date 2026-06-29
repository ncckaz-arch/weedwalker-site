import { MemberPanel } from '@/components/member-panel';

export default function MemberPage() {
  return (
    <main className="walker-shell pb-16 pt-8">
      <section className="mb-8">
        <p className="mb-4 inline-flex rounded-full border border-walkerYellow/30 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-walkerYellow">
          Application Status
        </p>
        <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.06em] md:text-7xl">
          Application Status Flow.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#d9d3bd]">
          เข้าสู่ระบบด้วย Google เพื่อดูสถานะการสมัคร การนัดหมาย เอกสาร และข้อมูลที่เกี่ยวข้องกับคลินิกพาร์ทเนอร์
        </p>
      </section>

      <MemberPanel />
    </main>
  );
}
