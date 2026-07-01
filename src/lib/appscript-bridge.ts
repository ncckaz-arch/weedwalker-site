import type { IntakeSubmission } from '@prisma/client';

type ForwardParams = {
  intake: IntakeSubmission;
  idCardFile: File | null;
  processedImageDataUrl?: string | null;
  symptoms?: string | null;
};

type ForwardResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  response?: unknown;
};

export function appScriptBridgeRequired() {
  return process.env.APPS_SCRIPT_FORWARD_REQUIRED === 'true';
}

export async function forwardIntakeToAppsScript(params: ForwardParams): Promise<ForwardResult> {
  const url = String(process.env.APPS_SCRIPT_INTAKE_URL || '').trim();

  if (!url) {
    return { ok: true, skipped: true, reason: 'APPS_SCRIPT_INTAKE_URL is not configured.' };
  }

  if (process.env.APPS_SCRIPT_FORWARD_FILES !== 'true') {
    return { ok: true, skipped: true, reason: 'APPS_SCRIPT_FORWARD_FILES is not enabled.' };
  }

  if (!params.idCardFile || params.idCardFile.size === 0) {
    return { ok: false, skipped: true, reason: 'ID card file is required for Apps Script forwarding.' };
  }

  const maxFileMb = Number(process.env.APPS_SCRIPT_MAX_FILE_MB || 8);
  const maxFileBytes = Math.max(1, maxFileMb) * 1024 * 1024;

  if (params.idCardFile.size > maxFileBytes) {
    return {
      ok: false,
      skipped: true,
      reason: `ID card file is larger than APPS_SCRIPT_MAX_FILE_MB (${maxFileMb}MB).`
    };
  }

  const originalImage = await fileToDataUrl(params.idCardFile);
  const processedImage = normalizeProcessedImage(params.processedImageDataUrl, originalImage);

  if (!processedImage) {
    return { ok: false, skipped: true, reason: 'Processed JPEG image is missing for Apps Script forwarding.' };
  }

  const controller = new AbortController();
  const timeoutMs = Math.max(5000, Number(process.env.APPS_SCRIPT_TIMEOUT_MS || 20000));
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'submit_application',
        source: 'weedwalker-native',
        secret: process.env.APPS_SCRIPT_BRIDGE_SECRET || '',
        payload: {
          requestId: legacyRequestId(params.intake.submittedAt, params.intake.id),
          nativeIntakeId: params.intake.id,
          memberName: params.intake.fullName,
          memberPhone: params.intake.phone,
          email: params.intake.email,
          symptoms: params.symptoms || params.intake.currentSymptoms || params.intake.intendedUse || '-',
          telemedInterest: 'MANDATORY_TELEMED_ONBOARDING',
          telemedConsent: true,
          consultationRecordConsent: true,
          consent: true,
          website: '',
          originalImage,
          processedImage
        }
      }),
      signal: controller.signal
    });

    const text = await response.text();
    const body = parseJson(text);

    if (!response.ok || (body && typeof body === 'object' && 'success' in body && body.success === false)) {
      return {
        ok: false,
        reason: extractReason(body) || `Apps Script returned HTTP ${response.status}`,
        response: body || text
      };
    }

    return { ok: true, response: body || text };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : 'Apps Script forwarding failed.'
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function fileToDataUrl(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || 'image/jpeg';

  return `data:${mimeType};base64,${bytes.toString('base64')}`;
}

function normalizeProcessedImage(processedImageDataUrl: string | null | undefined, originalImage: string) {
  const processed = String(processedImageDataUrl || '').trim();

  if (/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(processed)) {
    return processed;
  }

  if (/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(originalImage)) {
    return originalImage;
  }

  return null;
}

function legacyRequestId(date: Date, intakeId: string) {
  const bangkokDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const yyyy = bangkokDate.getUTCFullYear();
  const mm = String(bangkokDate.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(bangkokDate.getUTCDate()).padStart(2, '0');
  const hh = String(bangkokDate.getUTCHours()).padStart(2, '0');
  const mi = String(bangkokDate.getUTCMinutes()).padStart(2, '0');
  const ss = String(bangkokDate.getUTCSeconds()).padStart(2, '0');
  const suffix = intakeId.replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase().padEnd(6, 'X');

  return `WW-${yyyy}${mm}${dd}-${hh}${mi}${ss}-${suffix}`;
}

function parseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractReason(body: unknown) {
  if (!body || typeof body !== 'object') return '';
  const value = 'error' in body ? body.error : 'message' in body ? body.message : '';

  return typeof value === 'string' ? value : '';
}
