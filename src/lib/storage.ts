import { createHash, randomUUID } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { Storage, type StorageOptions } from '@google-cloud/storage';
import { UploadKind } from '@prisma/client';

export type SavedUpload = {
  storageKey: string;
  checksumSha256: string;
};

export type SavedGeneratedPdf = {
  storageKey: string;
  checksumSha256: string;
  contentBytes?: Buffer;
};

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
]);

export function fileUploadsEnabled() {
  if (process.env.ENABLE_FILE_UPLOADS !== 'true') return false;
  if (process.env.NODE_ENV === 'production' && !process.env.GCS_BUCKET_NAME) return false;
  return true;
}

export function publicFileUploadsEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_FILE_UPLOADS === 'true';
}

export function assertUploadAllowed(file: File) {
  const maxMb = Number(process.env.MAX_UPLOAD_MB || '12');
  const maxBytes = maxMb * 1024 * 1024;

  if (!allowedMimeTypes.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }

  if (file.size > maxBytes) {
    throw new Error(`File is larger than ${maxMb}MB.`);
  }
}

export async function saveUpload(params: {
  ownerKey: string;
  kind: UploadKind;
  file: File;
}) : Promise<SavedUpload> {
  if (!fileUploadsEnabled()) {
    throw new Error('File uploads are disabled for first launch.');
  }

  assertUploadAllowed(params.file);

  const buffer = Buffer.from(await params.file.arrayBuffer());
  const checksumSha256 = createHash('sha256').update(buffer).digest('hex');
  const ext = safeExtension(params.file.name, params.file.type);
  const storageKey = [
    'member-documents',
    params.ownerKey,
    params.kind.toLowerCase(),
    `${Date.now()}-${randomUUID()}${ext}`
  ].join('/');

  const bucketName = process.env.GCS_BUCKET_NAME;
  if (bucketName) {
    const storage = new Storage(googleStorageOptions());
    await storage.bucket(bucketName).file(storageKey).save(buffer, {
      resumable: false,
      contentType: params.file.type,
      metadata: {
        metadata: {
          originalName: params.file.name,
          checksumSha256
        }
      }
    });
    return { storageKey, checksumSha256 };
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('GCS_BUCKET_NAME is required when file uploads are enabled in production.');
  }

  const localRoot = process.env.LOCAL_UPLOAD_DIR || './data/uploads';
  const fullPath = path.join(process.cwd(), localRoot, storageKey);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, buffer);
  return { storageKey, checksumSha256 };
}

export async function saveGeneratedPdf(params: {
  ownerKey: string;
  documentType: string;
  pdfBytes: Uint8Array | Buffer;
}): Promise<SavedGeneratedPdf> {
  const buffer = Buffer.from(params.pdfBytes);
  const checksumSha256 = createHash('sha256').update(buffer).digest('hex');
  const storageKey = [
    'generated-pdfs',
    safePathPart(params.ownerKey),
    safePathPart(params.documentType.toLowerCase()),
    `${Date.now()}-${randomUUID()}.pdf`
  ].join('/');

  const bucketName = process.env.GCS_BUCKET_NAME;
  if (bucketName) {
    const storage = new Storage(googleStorageOptions());
    await storage.bucket(bucketName).file(storageKey).save(buffer, {
      resumable: false,
      contentType: 'application/pdf',
      metadata: {
        metadata: {
          checksumSha256,
          generatedBy: 'weedwalker-experience-platform'
        }
      }
    });
    return { storageKey, checksumSha256 };
  }

  if (process.env.NODE_ENV !== 'production') {
    const localRoot = process.env.LOCAL_UPLOAD_DIR || './data/uploads';
    const fullPath = path.join(process.cwd(), localRoot, storageKey);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, buffer);
    return { storageKey, checksumSha256 };
  }

  return {
    storageKey: `db://${storageKey}`,
    checksumSha256,
    contentBytes: buffer
  };
}

export async function readStoredPdf(params: {
  storageKey: string | null;
  contentBytes?: Buffer | Uint8Array | null;
}): Promise<Buffer> {
  if (params.contentBytes) {
    return Buffer.from(params.contentBytes);
  }

  if (!params.storageKey) {
    throw new Error('Document file is not available yet.');
  }

  const bucketName = process.env.GCS_BUCKET_NAME;
  if (bucketName && !params.storageKey.startsWith('db://')) {
    const storage = new Storage(googleStorageOptions());
    const [buffer] = await storage.bucket(bucketName).file(params.storageKey).download();
    return Buffer.from(buffer);
  }

  if (process.env.NODE_ENV !== 'production' && !params.storageKey.startsWith('db://')) {
    const localRoot = process.env.LOCAL_UPLOAD_DIR || './data/uploads';
    const root = path.resolve(process.cwd(), localRoot);
    const filePath = path.resolve(root, params.storageKey);

    if (!filePath.startsWith(root)) {
      throw new Error('Invalid document path.');
    }

    return readFile(filePath);
  }

  throw new Error('Document storage is not configured.');
}

export function googleStorageOptions(): StorageOptions {
  const rawCredentials =
    process.env.GOOGLE_CLOUD_CREDENTIALS_JSON ||
    process.env.GCS_SERVICE_ACCOUNT_JSON ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!rawCredentials) return {};

  const json = rawCredentials.trim().startsWith('{')
    ? rawCredentials
    : Buffer.from(rawCredentials, 'base64').toString('utf8');
  const credentials = JSON.parse(json) as {
    project_id?: string;
    client_email?: string;
    private_key?: string;
  };

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('Invalid Google Cloud Storage credentials JSON.');
  }

  return {
    projectId: credentials.project_id,
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key
    }
  };
}

function safeExtension(fileName: string, mimeType: string) {
  const ext = path.extname(fileName).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp', '.pdf'].includes(ext)) return ext;
  if (mimeType === 'image/jpeg') return '.jpg';
  if (mimeType === 'image/png') return '.png';
  if (mimeType === 'image/webp') return '.webp';
  if (mimeType === 'application/pdf') return '.pdf';
  return '';
}

function safePathPart(value: string) {
  return value.replace(/[^a-z0-9_-]/gi, '-').replace(/-+/g, '-').slice(0, 90) || 'document';
}
