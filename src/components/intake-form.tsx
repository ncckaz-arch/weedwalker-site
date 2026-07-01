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
    await attachAppsScriptProcessedImage(formData, signature);

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

          <label className="access-field md:col-span-2">
            <span className="access-icon">@</span>
            <input name="email" required type="email" placeholder="Email / อีเมลที่ใช้เข้าสู่ Member Portal" />
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

async function attachAppsScriptProcessedImage(formData: FormData, signatureDataUrl: string) {
  if (process.env.NEXT_PUBLIC_APPS_SCRIPT_FORWARD_FILES !== 'true') {
    return;
  }

  const idCard = formData.get('idCard');

  if (!(idCard instanceof File) || idCard.size === 0) {
    return;
  }

  try {
    const idCardDataUrl = await readFileAsDataUrl(idCard);
    const processedImage = await buildAppsScriptProcessedImage({
      idCardDataUrl,
      signatureDataUrl,
      fullName: String(formData.get('fullName') || ''),
      phone: String(formData.get('phone') || ''),
      email: String(formData.get('email') || ''),
      condition: String(formData.get('conditionIntention') || '')
    });

    formData.set('appScriptProcessedImageDataUrl', processedImage);
  } catch (error) {
    console.warn('[apps-script-bridge] unable to build processed image', error);
  }
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Unable to read file.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to load image.'));
    image.src = src;
  });
}

async function buildAppsScriptProcessedImage({
  idCardDataUrl,
  signatureDataUrl,
  fullName,
  phone,
  email,
  condition
}: {
  idCardDataUrl: string;
  signatureDataUrl: string;
  fullName: string;
  phone: string;
  email: string;
  condition: string;
}) {
  const [idImage, signatureImage] = await Promise.all([
    loadImage(idCardDataUrl),
    signatureDataUrl ? loadImage(signatureDataUrl) : Promise.resolve(null)
  ]);
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1700;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas is not available.');
  }

  ctx.fillStyle = '#f6f0db';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, canvas.width, 92);
  ctx.fillStyle = '#ffd21a';
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.fillText('WEED WALKER · ACCESS WITHIN · MEMBER SIGNATURE FILE', 72, 58);

  const imageBox = { x: 170, y: 120, width: 860, height: 620 };
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(imageBox.x - 14, imageBox.y - 14, imageBox.width + 28, imageBox.height + 28);
  ctx.shadowColor = 'rgba(0,0,0,0.22)';
  ctx.shadowBlur = 22;
  drawImageContain(ctx, idImage, imageBox.x, imageBox.y, imageBox.width, imageBox.height);
  ctx.shadowBlur = 0;

  ctx.save();
  ctx.translate(600, 710);
  ctx.rotate(-Math.PI / 5.5);
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 54px Arial, sans-serif';
  for (let y = -520; y <= 520; y += 150) {
    ctx.fillText('ใช้ประกอบคำขอ WEED WALKER เท่านั้น', -640, y);
    ctx.fillText('WEED WALKER ONLY', 160, y + 72);
  }
  ctx.restore();

  ctx.fillStyle = '#111111';
  ctx.font = 'bold 44px Arial, sans-serif';
  ctx.fillText('คำยืนยันของผู้ยื่นคำขอ', 72, 835);
  ctx.font = '36px Arial, sans-serif';
  const lines = [
    `ข้าพเจ้า ${fullName || '-'} สมาชิกเบอร์โทร ${phone || '-'} อีเมล ${email || '-'}`,
    'ยืนยันว่าได้ให้ข้อมูลสำหรับการสมัครสมาชิกและการประสานงานกับคลินิกพาร์ทเนอร์ตามความจริง',
    `ข้อมูลสุขภาพ/เหตุผลที่แจ้ง: ${condition || '-'}`,
    'ข้าพเจ้ารับทราบว่าเอกสารนี้เป็นเพียงหลักฐานการรับข้อมูลเบื้องต้น',
    'ไม่ใช่คำวินิจฉัย ใบอนุญาต หรือเอกสารทางการแพทย์'
  ];
  let y = 905;

  for (const line of lines) {
    y = drawWrappedLine(ctx, line, 72, y, 1060, 48);
    y += 10;
  }

  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(700, 1500);
  ctx.lineTo(1100, 1500);
  ctx.stroke();

  if (signatureImage) {
    drawImageContain(ctx, signatureImage, 760, 1330, 280, 130);
  }

  ctx.font = 'bold 34px Arial, sans-serif';
  ctx.fillText('ลงลายมือชื่อผู้ยื่นคำขอ', 762, 1548);
  ctx.font = '24px Arial, sans-serif';
  ctx.fillText(`ออกเมื่อ ${new Date().toLocaleDateString('th-TH')}`, 822, 1584);

  return canvas.toDataURL('image/jpeg', 0.88);
}

function drawImageContain(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const ratio = Math.min(width / image.width, height / image.height);
  const drawWidth = image.width * ratio;
  const drawHeight = image.height * ratio;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function drawWrappedLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;

    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) {
    ctx.fillText(line, x, currentY);
  }

  return currentY + lineHeight;
}
