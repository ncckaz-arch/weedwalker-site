import { Suspense } from 'react';
import { MemberPanel } from '@/components/member-panel';

export const metadata = {
  title: 'Member Portal | WEED WALKER',
  description: 'WEED WALKER member dashboard for application status, documents, and partner clinic coordination.'
};

export default function MemberPage() {
  return (
    <main className="walker-shell pb-16 pt-8">
      <section className="mb-8">
        <p className="mb-4 inline-flex rounded-full border border-walkerYellow/30 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-walkerYellow">
          Member Portal
        </p>
        <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.06em] md:text-7xl">
          Member Dashboard.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#d9d3bd]">
          เข้าสู่ระบบด้วย Google เพื่อดูสถานะการสมัคร การนัดหมาย เอกสาร และข้อมูลที่เกี่ยวข้องกับคลินิกพาร์ทเนอร์
        </p>
      </section>

      <Suspense
        fallback={
          <section className="walker-card p-6 md:p-8">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-walkerYellow">
              Loading Application Status...
            </p>
          </section>
        }
      >
        <MemberPanel />
      </Suspense>
    </main>
  );
}
