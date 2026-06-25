type AppsScriptForwardFile = {
  field: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  base64?: string;
};

export type AppsScriptForwardPayload = {
  intakeId: string;
  submittedAt: string;
  source: 'weedwalker.net';
  version: 'intake-v1';
  profile: {
    fullName: string;
    phone: string;
    email: string;
    lineId?: string | null;
  };
  telemed: {
    conditionIntention?: string | null;
    requestTelemed: boolean;
    preferredDate?: string | null;
    note?: string | null;
  };
  consents: {
    telemedConsent: boolean;
    pdpaConsent: boolean;
    medicalIntakeConsent: boolean;
    documentStorageConsent: boolean;
    termsConsent: boolean;
  };
  signatureDataUrl?: string | null;
  files: AppsScriptForwardFile[];
};

export function appsScriptForwardingEnabled() {
  return Boolean(process.env.APPS_SCRIPT_INTAKE_URL);
}

export function appsScriptForwardRequired() {
  return process.env.APPS_SCRIPT_FORWARD_REQUIRED === 'true';
}

export function appsScriptFileForwardingEnabled() {
  return process.env.APPS_SCRIPT_FORWARD_FILES === 'true';
}

export async function fileToAppsScriptPayload(field: string, file: File): Promise<AppsScriptForwardFile> {
  const base = {
    field,
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size
  };

  if (!appsScriptFileForwardingEnabled()) {
    return base;
  }

  const maxMb = Number(process.env.APPS_SCRIPT_MAX_FILE_MB || '10');
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`${field} is larger than ${maxMb}MB.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return {
    ...base,
    base64: buffer.toString('base64')
  };
}

export async function forwardIntakeToAppsScript(payload: AppsScriptForwardPayload) {
  const url = process.env.APPS_SCRIPT_INTAKE_URL;
  if (!url) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.APPS_SCRIPT_TIMEOUT_MS || '12000'));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Apps Script returned ${response.status}: ${text.slice(0, 300)}`);
    }

    return {
      ok: true,
      status: response.status,
      bodyPreview: text.slice(0, 300)
    };
  } finally {
    clearTimeout(timeout);
  }
}
