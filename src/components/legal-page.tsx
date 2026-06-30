type LegalSection = {
  title: string;
  body: string;
};

type LegalPageProps = {
  titleAccent: string;
  titleRest: string;
  subtitle: string;
  sections: LegalSection[];
};

export function LegalPage({ titleAccent, titleRest, subtitle, sections }: LegalPageProps) {
  return (
    <main className="legal-shell">
      <a className="legal-back" href="/intake">
        ← Back
      </a>

      <section className="legal-hero">
        <p className="legal-kicker">
          <span />
          WEED WALKER
          <span />
        </p>
        <h1>
          <span>{titleAccent}</span> {titleRest}
        </h1>
        <p>{subtitle}</p>
      </section>

      <div className="legal-grid">
        <section className="legal-content-card">
          {sections.map((section, index) => (
            <article key={section.title} className="legal-section">
              <h2>
                {index + 1}. {section.title}
              </h2>
              <p>{section.body}</p>
            </article>
          ))}
        </section>

        <aside className="legal-side">
          <section className="legal-safety-card">
            <h2>ปลอดภัย มั่นใจได้</h2>
            <ul>
              <li>
                <span>▣</span>
                <div>
                  <strong>ข้อมูลของคุณถูกเข้ารหัส</strong>
                  <p>เราเก็บข้อมูลบนระบบดิจิทัลและจำกัดสิทธิ์การเข้าถึงเฉพาะผู้ได้รับอนุญาต</p>
                </div>
              </li>
              <li>
                <span>◎</span>
                <div>
                  <strong>เป็นส่วนตัว 100%</strong>
                  <p>ข้อมูลของคุณจะไม่ถูกเปิดเผยต่อสาธารณะ หรือใช้เกินวัตถุประสงค์ที่แจ้งไว้</p>
                </div>
              </li>
              <li>
                <span>▤</span>
                <div>
                  <strong>ประสานคลินิกพาร์ทเนอร์เท่านั้น</strong>
                  <p>WEED WALKER ทำหน้าที่รับข้อมูลและส่งต่อให้คลินิกพาร์ทเนอร์ที่ได้รับอนุญาตเท่าที่จำเป็น</p>
                </div>
              </li>
            </ul>
          </section>

          <section className="legal-actions-card" aria-label="Member support actions">
            <a href="mailto:weedwalkerkth@gmail.com?subject=PDPA%20Rights%20Request">
              <span>◇</span>
              <div>
                <strong>PDPA Rights Request</strong>
                <small>ขอเข้าถึง แก้ไข ลบ หรือถอนความยินยอม</small>
              </div>
              <b>›</b>
            </a>
            <a href="https://lin.ee/yNXeTBs">
              <span>✦</span>
              <div>
                <strong>Contact Support</strong>
                <small>อีเมล LINE OA และเบอร์โทรติดต่อทีม</small>
              </div>
              <b>›</b>
            </a>
          </section>
        </aside>
      </div>
    </main>
  );
}
