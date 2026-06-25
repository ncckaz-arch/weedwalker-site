'use client';

import { FormEvent, PointerEvent, useRef, useState } from 'react';

type SubmitResponse = {
  ok?: boolean;
  intakeId?: string;
  telemedRequestId?: string | null;
  appsScriptWarning?: string | null;
  error?: string;
};

export function IntakeForm() {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [hasSignature, setHasSignature] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const uploadsEnabled =
    process.env.NEXT_PUBLIC_ENABLE_FILE_UPLOADS === 'true' ||
    process.env.NEXT_PUBLIC_APPS_SCRIPT_FORWARD_FILES === 'true';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('Submitting intake...');
    setError('');
    setWarning('');

    const form = event.currentTarget;
    const formData = new FormData(form);
    const signature = canvasRef.current?.toDataURL('image/png') || '';
    if (hasSignature) {
      formData.set('signatureDataUrl', signature);
    }

    const response = await fetch('/api/intake', {
      method: 'POST',
      body: formData
    });
    const body = (await response.json().catch(() => ({}))) as SubmitResponse;

    if (!response.ok) {
      setStatus('');
      setError(body.error || 'Submit failed.');
      return;
    }

    setStatus(`Intake submitted. Reference: ${body.intakeId}`);
    if (body.appsScriptWarning) {
      setWarning(`Saved on weedwalker.net, but Apps Script sync needs attention: ${body.appsScriptWarning}`);
    }
    form.reset();
    clearSignature();
  }

  function point(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function startDrawing(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawing.current = true;
    canvas.setPointerCapture(event.pointerId);
    const ctx = canvas.getContext('2d');
    const p = point(event);
    if (!ctx) return;
    ctx.strokeStyle = '#ffd21a';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function draw(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const p = point(event);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    setHasSignature(true);
  }

  function stopDrawing() {
    drawing.current = false;
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }

  return (
    <form onSubmit={submit} className="walker-card grid gap-8 p-5 md:p-8">
      <input className="hidden" name="website" tabIndex={-1} autoComplete="off" />
      <input type="hidden" name="requestTelemed" value="true" />

      <section className="grid gap-4">
        <SectionTitle number="01" title="Member Profile" />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="walker-label">
            ชื่อ-นามสกุล *
            <input className="walker-input" name="fullName" required placeholder="ระบุชื่อ-นามสกุล" />
          </label>
          <label className="walker-label">
            เบอร์โทรสมาชิก *
            <input className="walker-input" name="phone" required placeholder="ระบุเบอร์โทรสมาชิก" />
          </label>
          <label className="walker-label md:col-span-2">
            Email *
            <input className="walker-input" name="email" type="email" required placeholder="ระบุอีเมลสมาชิก" />
            <span className="walker-muted text-xs">ใช้สำหรับส่งลิงก์ Portal และติดต่อกลับเท่านั้น</span>
          </label>
          <label className="walker-label">
            LINE ID / LINE OA name
            <input className="walker-input" name="lineId" placeholder="@weedwalker หรือ Line ID ของคุณ" />
          </label>
          <label className="walker-label">
            วันเกิด
            <input className="walker-input" name="dateOfBirth" type="date" />
          </label>
        </div>
      </section>

      <section className="grid gap-4">
        <SectionTitle number="02" title="Telemed Consent & Data Consent" />
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm leading-7 text-[#ddd5bd]">
            ข้าพเจ้ายินยอมให้ WEED WALKER ใช้ข้อมูลที่ให้ไว้เพื่อดำเนินกระบวนการสมัครสมาชิก
            การประเมินข้อมูล การประสานงาน Telemed การให้คำปรึกษา และการจัดทำเอกสารที่เกี่ยวข้องตามกฎหมาย
          </p>
          <label className="mt-4 flex gap-3 text-sm font-bold text-[#ddd5bd]">
            <input name="telemedConsent" type="checkbox" required />
            ข้าพเจ้าได้อ่านและยอมรับการให้ข้อมูล การประเมิน Telemed การจัดเก็บข้อมูลสมาชิก และการดำเนินการที่เกี่ยวข้องตามนโยบายของ WEED WALKER
          </label>
        </div>

        <label className="walker-label">
          Condition / Intention สำหรับ Telemed *
          <textarea
            className="walker-input min-h-36"
            name="conditionIntention"
            required
            placeholder="ระบุอาการ โรค หรือเหตุผลที่ต้องการใช้กัญชา เช่น นอนไม่หลับ ปวดเรื้อรัง คลายเครียด หรือข้อมูลสำคัญที่ต้องการให้ทีมรับทราบ"
          />
          <span className="walker-muted text-xs">
            ข้อมูลนี้ใช้ประกอบการประเมิน Telemed เบื้องต้น ไม่ใช่คำวินิจฉัยหรือใบอนุญาตทางการแพทย์
          </span>
        </label>
      </section>

      <section className="grid gap-4">
        <SectionTitle number="03" title="Identity Verification" />
        {uploadsEnabled ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="walker-label rounded-3xl border border-walkerYellow/20 bg-walkerYellow/5 p-5">
              Upload ID Card / Passport *
              <input className="walker-input" name="idCard" type="file" accept="image/png,image/jpeg,image/webp" required />
              <span className="walker-muted text-xs">JPG, PNG หรือ WEBP · ไม่เกิน 10MB · Required</span>
            </label>
            <label className="walker-label rounded-3xl border border-walkerYellow/20 bg-walkerYellow/5 p-5">
              Upload Selfie Holding ID *
              <input className="walker-input" name="selfie" type="file" accept="image/png,image/jpeg,image/webp" required />
              <span className="walker-muted text-xs">ให้เห็นใบหน้าและบัตรชัดเจนในภาพเดียวกัน</span>
            </label>
          </div>
        ) : (
          <div className="rounded-3xl border border-walkerYellow/20 bg-walkerYellow/5 p-5">
            <p className="text-sm font-black text-walkerYellow">Upload disabled for this deployment</p>
            <p className="mt-2 text-sm leading-6 text-walkerMuted">
              หน้าเว็บพร้อมรับ identity fields แล้ว แต่การส่งไฟล์ ID/Selfie จะเปิดเมื่อ Apps Script receiver หรือ production storage พร้อมใช้งาน
            </p>
          </div>
        )}
      </section>

      <section className="grid gap-4">
        <SectionTitle number="04" title="Digital Signature" />
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <canvas
            ref={canvasRef}
            width={900}
            height={260}
            className="h-44 w-full touch-none rounded-2xl border border-white/10 bg-black/40"
            aria-label="ช่องเซ็นลายเซ็นดิจิทัล"
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="walker-muted text-xs">เซ็นชื่อในช่องนี้ด้วยนิ้วหรือเมาส์ ลายเซ็นจะถูกส่งไปพร้อม intake payload</p>
            <button className="walker-btn walker-btn-outline" type="button" onClick={clearSignature}>
              Clear
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-walkerYellow">Data Covenant</p>
        <p className="text-sm leading-7 text-walkerMuted">
          WEED WALKER ให้ความสำคัญกับความเป็นส่วนตัวของสมาชิก ข้อมูลจะถูกใช้เพื่อการบริหารสมาชิก
          การประสานงาน Telemed และการจัดทำเอกสารที่เกี่ยวข้องเท่านั้น
        </p>
        <label className="flex gap-3 text-sm font-bold">
          <input name="pdpaConsent" type="checkbox" required />
          I consent to PDPA data handling for this intake.
        </label>
        <label className="flex gap-3 text-sm font-bold">
          <input name="medicalIntakeConsent" type="checkbox" required />
          I confirm the intake information is accurate.
        </label>
        <label className="flex gap-3 text-sm font-bold">
          <input name="documentStorageConsent" type="checkbox" required />
          I consent to secure storage of uploaded documents and generated PDFs.
        </label>
        <label className="flex gap-3 text-sm font-bold">
          <input name="termsConsent" type="checkbox" required />
          ข้าพเจ้าได้อ่านและยอมรับข้อตกลงและเงื่อนไขการใช้งานของ WEED WALKER แล้ว
        </label>
      </section>

      <button className="walker-btn walker-btn-primary w-full md:w-auto" type="submit">
        Activate Profile
      </button>

      {status ? <p className="font-bold text-walkerYellow">{status}</p> : null}
      {warning ? <p className="text-sm font-bold text-amber-200">{warning}</p> : null}
      {error ? <p className="font-bold text-red-300">{error}</p> : null}
    </form>
  );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-[-0.04em]">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-walkerYellow text-sm text-walkerBlack">{number}</span>
      {title}
    </h2>
  );
}
