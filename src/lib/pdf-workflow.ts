import { readFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import fontkit from '@pdf-lib/fontkit';
import { IntakeSubmission, PdfStatus, TelemedRequest } from '@prisma/client';
import { degrees, PDFDocument, PDFFont, PDFPage, rgb } from 'pdf-lib';
import { prisma } from '@/lib/db';
import { saveGeneratedPdf } from '@/lib/storage';

const FONT_PATH = path.join(process.cwd(), 'public', 'fonts', 'NotoSansThai-Regular.ttf');

type IntakeWithTelemed = IntakeSubmission & {
  telemedRequest: TelemedRequest | null;
};

type DrawContext = {
  page: PDFPage;
  font: PDFFont;
  width: number;
  height: number;
  y: number;
};

export async function ensureIntakePdfWorkflow(params: {
  intakeId: string;
  signatureDataUrl?: string | null;
}) {
  const intake = await prisma.intakeSubmission.findUnique({
    where: { id: params.intakeId },
    include: {
      telemedRequest: true,
      pdfDocuments: true
    }
  });

  if (!intake) {
    throw new Error('Intake submission was not found for PDF generation.');
  }

  const ownerKey = intake.userId || intake.id;
  const existingTypes = new Set(intake.pdfDocuments.map((document) => document.documentType));

  let signedConsent = intake.pdfDocuments.find((document) => document.documentType === 'SIGNED_CONSENT');

  if (!signedConsent) {
    const pdfBytes = await createSignedConsentPdf(intake, params.signatureDataUrl);
    const saved = await saveGeneratedPdf({
      ownerKey,
      documentType: 'SIGNED_CONSENT',
      pdfBytes
    });

    signedConsent = await prisma.pdfDocument.create({
      data: {
        userId: intake.userId,
        intakeId: intake.id,
        telemedRequestId: intake.telemedRequest?.id || null,
        title: 'Signed Consent Form',
        documentType: 'SIGNED_CONSENT',
        storageKey: saved.storageKey,
        contentBytes: saved.contentBytes,
        accessToken: randomUUID(),
        status: PdfStatus.AVAILABLE
      }
    });
  }

  await ensureGeneratedDocument({
    intake,
    ownerKey,
    existingTypes,
    documentType: 'PT33',
    title: 'P.T.33 Draft',
    status: PdfStatus.PROCESSING,
    createPdf: () => createPt33DraftPdf(intake)
  });

  await ensureGeneratedDocument({
    intake,
    ownerKey,
    existingTypes,
    documentType: 'MEDICAL_CERTIFICATE_DRAFT',
    title: 'Medical Certificate Draft',
    status: PdfStatus.PROCESSING,
    createPdf: () => createMedicalCertificateDraftPdf(intake)
  });

  await ensureGeneratedDocument({
    intake,
    ownerKey,
    existingTypes,
    documentType: 'MEDICAL_CERTIFICATE_FINAL',
    title: 'Medical Certificate Final',
    status: PdfStatus.PROCESSING,
    createPdf: () => createMedicalCertificateFinalPendingPdf(intake)
  });

  return {
    signedConsentDocumentId: signedConsent.id,
    signedConsentAccessToken: signedConsent.accessToken
  };
}

async function ensureGeneratedDocument(params: {
  intake: IntakeWithTelemed;
  ownerKey: string;
  existingTypes: Set<string>;
  documentType: string;
  title: string;
  status: PdfStatus;
  createPdf: () => Promise<Uint8Array>;
}) {
  if (params.existingTypes.has(params.documentType)) return;

  const pdfBytes = await params.createPdf();
  const saved = await saveGeneratedPdf({
    ownerKey: params.ownerKey,
    documentType: params.documentType,
    pdfBytes
  });

  await prisma.pdfDocument.create({
    data: {
      userId: params.intake.userId,
      intakeId: params.intake.id,
      telemedRequestId: params.intake.telemedRequest?.id || null,
      title: params.title,
      documentType: params.documentType,
      storageKey: saved.storageKey,
      contentBytes: saved.contentBytes,
      status: params.status
    }
  });

  params.existingTypes.add(params.documentType);
}

async function createSignedConsentPdf(intake: IntakeWithTelemed, signatureDataUrl?: string | null) {
  const { pdfDoc, font, page, width, height } = await createBasePdf();
  const ctx: DrawContext = { page, font, width, height, y: height - 54 };

  drawHeader(ctx, 'WEED WALKER · ACCESS WITHIN · MEMBER SIGNATURE FILE');
  drawTitle(ctx, 'คำยืนยันของผู้ยื่นคำขอ', 'Signed Consent Form');

  drawParagraph(
    ctx,
    [
      `ข้าพเจ้า ${intake.fullName} เบอร์โทร ${intake.phone} อีเมล ${intake.email}`,
      `ยืนยันว่าข้อมูลที่ให้ไว้ในแบบฟอร์มสมาชิกและข้อมูลสุขภาพเป็นความจริงตามที่ข้าพเจ้าทราบ`,
      `อาการ/เหตุผลที่แจ้ง: ${intake.currentSymptoms || intake.intendedUse || '-'}`
    ],
    18
  );

  drawSection(ctx, 'Consent & Data Handling', [
    'ข้าพเจ้ายินยอมให้ WEED WALKER เก็บ ใช้ และส่งต่อข้อมูลที่จำเป็นให้คลินิกพาร์ทเนอร์ที่ได้รับอนุญาต เพื่อให้คลินิกเป็นผู้ติดต่อ ประเมิน และให้บริการตามขั้นตอนของคลินิก',
    'ข้าพเจ้ารับทราบว่า WEED WALKER ไม่ใช่สถานพยาบาล ไม่ได้วินิจฉัย รักษา สั่งจ่าย หรือออกเอกสารทางการแพทย์เอง'
  ]);

  const signatureImage = await embedSignature(pdfDoc, signatureDataUrl);
  const signatureY = 122;
  page.drawLine({
    start: { x: width - 260, y: signatureY },
    end: { x: width - 80, y: signatureY },
    thickness: 1,
    color: rgb(0.12, 0.12, 0.12)
  });

  if (signatureImage) {
    page.drawImage(signatureImage, {
      x: width - 245,
      y: signatureY + 12,
      width: 150,
      height: 58
    });
  }

  page.drawText('ลงลายมือชื่อผู้ยื่นคำขอ', {
    x: width - 237,
    y: signatureY - 24,
    size: 14,
    font,
    color: rgb(0.05, 0.05, 0.05)
  });

  drawFooter(ctx, `เลขอ้างอิง ${intake.id}`, intake.submittedAt);
  return pdfDoc.save();
}

async function createPt33DraftPdf(intake: IntakeWithTelemed) {
  const { pdfDoc, font, page, width, height } = await createBasePdf();
  const ctx: DrawContext = { page, font, width, height, y: height - 54 };

  drawHeader(ctx, 'WEED WALKER · PARTNER CLINIC DOCUMENT WORKFLOW');
  drawTitle(ctx, 'ภ.ท.33 - Draft', 'Pending licensed partner clinic review');
  drawWatermark(ctx, 'DRAFT');
  drawSection(ctx, 'ข้อมูลผู้ยื่นคำขอ', [
    `ชื่อ: ${intake.fullName}`,
    `เบอร์โทร: ${intake.phone}`,
    `อีเมล: ${intake.email}`,
    `เลขอ้างอิงใบสมัคร: ${intake.id}`
  ]);
  drawSection(ctx, 'หมายเหตุสำคัญ', [
    'เอกสารนี้เป็นร่างเพื่อประกอบการประสานงานกับคลินิกพาร์ทเนอร์เท่านั้น',
    'การประเมิน การอนุมัติ และการออกเอกสาร ภ.ท.33 เป็นความรับผิดชอบของคลินิกพาร์ทเนอร์และผู้ประกอบวิชาชีพที่ได้รับอนุญาต'
  ]);
  drawFooter(ctx, `PT33 draft for intake ${intake.id}`, new Date());
  return pdfDoc.save();
}

async function createMedicalCertificateDraftPdf(intake: IntakeWithTelemed) {
  const { pdfDoc, font, page, width, height } = await createBasePdf();
  const ctx: DrawContext = { page, font, width, height, y: height - 54 };

  drawHeader(ctx, 'WEED WALKER · PARTNER CLINIC DOCUMENT WORKFLOW');
  drawTitle(ctx, 'Medical Certificate Draft', 'For partner clinic review only');
  drawWatermark(ctx, 'DRAFT');
  drawSection(ctx, 'ข้อมูลเบื้องต้น', [
    `ชื่อผู้ยื่นคำขอ: ${intake.fullName}`,
    `ข้อมูลที่แจ้ง: ${intake.currentSymptoms || intake.intendedUse || '-'}`,
    `วันที่ส่งแบบฟอร์ม: ${formatDateTime(intake.submittedAt)}`
  ]);
  drawSection(ctx, 'ข้อจำกัดของเอกสาร', [
    'เอกสารนี้ยังไม่ใช่ใบรับรองแพทย์ และไม่สามารถใช้แทนเอกสารทางการแพทย์ได้',
    'ต้องได้รับการประเมินและรับรองโดยคลินิกพาร์ทเนอร์และผู้ประกอบวิชาชีพที่ได้รับอนุญาตก่อนเท่านั้น'
  ]);
  drawFooter(ctx, `Certificate draft for intake ${intake.id}`, new Date());
  return pdfDoc.save();
}

async function createMedicalCertificateFinalPendingPdf(intake: IntakeWithTelemed) {
  const { pdfDoc, font, page, width, height } = await createBasePdf();
  const ctx: DrawContext = { page, font, width, height, y: height - 54 };

  drawHeader(ctx, 'WEED WALKER · PARTNER CLINIC DOCUMENT WORKFLOW');
  drawTitle(ctx, 'Medical Certificate Final', 'Pending licensed clinic approval');
  drawWatermark(ctx, 'PENDING');
  drawSection(ctx, 'สถานะเอกสาร', [
    'ยังไม่สามารถออกเอกสารฉบับสมบูรณ์ได้ในขั้นตอนนี้',
    'เอกสารฉบับสมบูรณ์จะใช้ได้ต่อเมื่อคลินิกพาร์ทเนอร์และผู้ประกอบวิชาชีพที่ได้รับอนุญาตเป็นผู้ประเมินและอนุมัติเท่านั้น'
  ]);
  drawSection(ctx, 'ข้อมูลอ้างอิง', [
    `ชื่อผู้ยื่นคำขอ: ${intake.fullName}`,
    `เลขอ้างอิงใบสมัคร: ${intake.id}`,
    `วันที่ส่งแบบฟอร์ม: ${formatDateTime(intake.submittedAt)}`
  ]);
  drawFooter(ctx, `Final certificate pending for intake ${intake.id}`, new Date());
  return pdfDoc.save();
}

async function createBasePdf() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const fontBytes = await readFile(FONT_PATH);
  const font = await pdfDoc.embedFont(fontBytes, { subset: true });
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.96, 0.94, 0.84)
  });

  return { pdfDoc, font, page, width, height };
}

function drawHeader(ctx: DrawContext, text: string) {
  ctx.page.drawRectangle({
    x: 0,
    y: ctx.height - 42,
    width: ctx.width,
    height: 42,
    color: rgb(0.02, 0.02, 0.02)
  });
  ctx.page.drawText(text, {
    x: 36,
    y: ctx.height - 28,
    size: 12,
    font: ctx.font,
    color: rgb(1, 0.83, 0.1)
  });
  ctx.y = ctx.height - 88;
}

function drawTitle(ctx: DrawContext, title: string, subtitle: string) {
  ctx.page.drawText(title, {
    x: 42,
    y: ctx.y,
    size: 28,
    font: ctx.font,
    color: rgb(0.04, 0.04, 0.04)
  });
  ctx.y -= 26;
  ctx.page.drawText(subtitle, {
    x: 42,
    y: ctx.y,
    size: 13,
    font: ctx.font,
    color: rgb(0.36, 0.34, 0.28)
  });
  ctx.y -= 40;
}

function drawSection(ctx: DrawContext, title: string, lines: string[]) {
  ctx.page.drawText(title, {
    x: 42,
    y: ctx.y,
    size: 16,
    font: ctx.font,
    color: rgb(0.04, 0.04, 0.04)
  });
  ctx.y -= 24;
  drawParagraph(ctx, lines, 14);
  ctx.y -= 10;
}

function drawParagraph(ctx: DrawContext, lines: string[], size: number) {
  for (const line of lines) {
    const wrapped = wrapText(line, 72);
    for (const item of wrapped) {
      ctx.page.drawText(item, {
        x: 42,
        y: ctx.y,
        size,
        font: ctx.font,
        color: rgb(0.12, 0.12, 0.1)
      });
      ctx.y -= size + 8;
    }
    ctx.y -= 6;
  }
}

function drawWatermark(ctx: DrawContext, text: string) {
  ctx.page.drawText(text, {
    x: 120,
    y: 400,
    size: 78,
    font: ctx.font,
    color: rgb(0.84, 0.78, 0.52),
    opacity: 0.18,
    rotate: degrees(-22)
  });
}

function drawFooter(ctx: DrawContext, leftText: string, date: Date) {
  ctx.page.drawText(leftText, {
    x: 42,
    y: 42,
    size: 10,
    font: ctx.font,
    color: rgb(0.36, 0.34, 0.28)
  });
  ctx.page.drawText(`ออกเมื่อ ${formatDateTime(date)}`, {
    x: ctx.width - 210,
    y: 42,
    size: 10,
    font: ctx.font,
    color: rgb(0.36, 0.34, 0.28)
  });
}

async function embedSignature(pdfDoc: PDFDocument, dataUrl?: string | null) {
  if (!dataUrl) return null;
  const match = dataUrl.match(/^data:image\/png;base64,(.+)$/);
  if (!match) return null;

  try {
    return await pdfDoc.embedPng(Buffer.from(match[1], 'base64'));
  } catch {
    return null;
  }
}

function wrapText(text: string, maxLength: number) {
  if (text.length <= maxLength) return [text];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxLength) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }

  if (current) lines.push(current);
  return lines.flatMap((line) => splitLongText(line, maxLength));
}

function splitLongText(text: string, maxLength: number) {
  if (text.length <= maxLength) return [text];
  const chunks: string[] = [];
  for (let index = 0; index < text.length; index += maxLength) {
    chunks.push(text.slice(index, index + maxLength));
  }
  return chunks;
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok'
  }).format(date);
}
