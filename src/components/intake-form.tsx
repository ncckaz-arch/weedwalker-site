'use client';

import { FormEvent, PointerEvent, useRef, useState } from 'react';

type SubmitResponse = {
  ok?: boolean;
  intakeId?: string;
  telemedRequestId?: string | null;
  signedConsentDocumentId?: string;
  successUrl?: string;
  error?: string;
};

export function IntakeForm() {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [hasSignature, setHasSignature] = useState(false);
  const [idCardName, setIdCardName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const uploadsEnabled = process.env.NEXT_PUBLIC_ENABLE_FILE_UPLOADS === 'true';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('');
    setError('');

    if (!hasSignature) {
      setError('กรุณาเซ็นชื่อดิจิทัลก่อนส่งแบบฟอร์ม');
      return;
    }

    setStatus('กำลังส่งแบบฟอร์ม...');

    const form = event.currentTarget;
    const formData = new FormData(form);
    const signature = canvasRef.current?.toDataURL('image/png') || '';
    formData.set('signatureDataUrl', signature);

    const response = await fetch('/api/intake', {
      method: 'POST',
      body: formData
    });
    const body = (await response.json().catch(() => ({}))) as SubmitResponse;

    if (!response.ok) {
      setStatus('');
      setError(body.error || 'ส่งแบบฟอร์มไม่สำเร็จ');
      return;
    }

    setStatus('ส่งข้อมูลเรียบร้อยแล้ว กำลังเปิดหน้ายืนยัน...');
    form.reset();
    setIdCardName('');
    clearSignature();
    window.location.assign(body.successUrl || `/intake/submitted?intakeId=${encodeURIComponent(body.intakeId || '')}`);
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
    <form
      id="member-profile"
      onSubmit={submit}
      className="scroll-mt-28 overflow-hidden rounded-[1.75rem] border border-walkerYellow/25 bg-black/55 p-5 shadow-[0_0_80px_rgba(0,0,0,0.5)] backdrop-blur md:p-8"
    >
      <input className="hidden" name="website" tabIndex={-1} autoComplete="off" />
      <input type="hidden" name="requestTelemed" value="true" />
      <input type="hidden" name="pdpaConsent" value="true" />
      <input type="hidden" name="documentStorageConsent" value="true" />
      <input type="hidden" name="medicalIntakeConsent" value="true" />
      <input type="hidden" name="telemedConsent" value="true" />

      <div className="mb-6 flex items-center gap-3 text-walkerYellow">
        <span className="text-3xl leading-none">♙</span>
        <h2 className="text-2xl font-black uppercase tracking-[0.04em]">Member Profile</h2>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="access-field">
            <span className="access-icon">♙</span>
            <input name="fullName" required placeholder="Full Name / ชื่อ-นามสกุล" />
          </label>

          <label className="access-field">
            <span className="access-icon">☏</span>
            <input name="phone" required placeholder="Phone Number / เบอร์โทร" />
          </label>
        </div>

        <label className="access-field access-field-area access-field-plain">
          <textarea
            name="conditionIntention"
            required
            maxLength={1000}
            placeholder="ระบุอาการ โรค หรือเหตุผลที่ต้องการใช้กัญชา เช่น นอนไม่หลับ ปวดเรื้อรัง คลายเครียด หรือข้อมูลสำคัญที่ต้องการให้คลินิกพาร์ทเนอร์รับทราบ"
          />
          <span className="walker-muted mt-3 block text-xs leading-5">
            ข้อมูลนี้ใช้ประกอบการส่งต่อให้คลินิกพาร์ทเนอร์เบื้องต้น ไม่ใช่คำวินิจฉัยหรือเอกสารทางการแพทย์
          </span>
        </label>

        <div>
          <p className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-walkerYellow">Upload ID Card</p>
          {uploadsEnabled ? (
            <label className="access-upload">
              <span className="text-3xl">▤</span>
              <span className="min-w-0 flex-1">
                <strong className="block text-base font-bold text-[#f7f3df]">
                  {idCardName || 'Upload ID Card / Passport'}
                </strong>
                <small className="walker-muted mt-1 block">PNG, JPG หรือ WEBP ไม่เกิน 10MB</small>
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-walkerYellow/10 text-xl text-walkerYellow">☁</span>
              <input
                className="sr-only"
                name="idCard"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                required
                onChange={(event) => setIdCardName(event.currentTarget.files?.[0]?.name || '')}
              />
            </label>
          ) : (
            <div className="access-upload opacity-80">
              <span className="text-3xl">▤</span>
              <span className="min-w-0 flex-1">
                <strong className="block text-base font-bold text-[#f7f3df]">Upload ID Card / Passport</strong>
                <small className="walker-muted mt-1 block">
                  ระบบรับข้อมูลพร้อมแล้ว แต่การอัปโหลดไฟล์จะเปิดเมื่อ production storage พร้อมใช้งาน
                </small>
              </span>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-white/14 bg-white/[0.035] p-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-2xl text-walkerYellow">✎</span>
            <div>
              <p className="font-bold text-[#f7f3df]">Digital Signature</p>
              <p className="walker-muted text-sm">ลายเซ็นดิจิทัล</p>
            </div>
          </div>
          <canvas
            ref={canvasRef}
            width={900}
            height={260}
            className="h-40 w-full touch-none rounded-2xl border border-white/10 bg-black/45"
            aria-label="ช่องเซ็นลายเซ็นดิจิทัล"
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="walker-muted text-xs">แตะหรือใช้เมาส์เพื่อเซ็นชื่อ</p>
            <button className="walker-btn walker-btn-outline min-h-10 px-4" type="button" onClick={clearSignature}>
              Clear
            </button>
          </div>
        </div>

        <label className="flex gap-3 rounded-2xl text-sm font-bold leading-7 text-[#ddd5bd]">
          <input className="mt-1 h-5 w-5 shrink-0 accent-walkerYellow" name="termsConsent" type="checkbox" required />
          <span>
            ข้าพเจ้ายืนยันว่าข้อมูลที่ให้ไว้เป็นความจริง และยินยอมให้ WEED WALKER เก็บ ใช้ และส่งต่อข้อมูลที่จำเป็นให้คลินิกพาร์ทเนอร์ที่ได้รับอนุญาต
            เพื่อให้คลินิกเป็นผู้ติดต่อ ประเมิน และให้บริการตามขั้นตอนของคลินิก โดยรับทราบว่า WEED WALKER ไม่ใช่สถานพยาบาลและไม่ได้ให้บริการทางการแพทย์เอง
            และข้าพเจ้าได้อ่านและยอมรับ{' '}
            <a className="text-walkerYellow underline underline-offset-4" href="/privacy-policy">
              นโยบายความเป็นส่วนตัว
            </a>{' '}
            และ{' '}
            <a className="text-walkerYellow underline underline-offset-4" href="/terms-of-use">
              ข้อตกลงการใช้งาน
            </a>{' '}
            แล้ว
          </span>
        </label>

        <button
          className="group grid min-h-[62px] w-full grid-cols-[52px_1fr_32px] items-center rounded-2xl bg-walkerYellow px-4 text-walkerBlack shadow-[0_0_42px_rgba(255,210,26,0.36)] transition hover:scale-[1.01]"
          type="submit"
        >
          <span className="text-2xl">▽</span>
          <span className="text-lg font-black md:text-2xl">ยืนยันและส่งแบบฟอร์ม</span>
          <span className="text-3xl transition group-hover:translate-x-1">›</span>
        </button>

        <p className="text-center text-xs font-bold text-walkerMuted">🔒 ข้อมูลของคุณปลอดภัยและเป็นความลับ</p>

        {status ? <p className="rounded-2xl border border-walkerYellow/25 bg-walkerYellow/10 p-4 font-bold text-walkerYellow">{status}</p> : null}
        {error ? <p className="rounded-2xl border border-red-300/25 bg-red-400/10 p-4 font-bold text-red-300">{error}</p> : null}
      </div>
    </form>
  );
}
