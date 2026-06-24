import { createHash, randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { Storage } from '@google-cloud/storage';
import { UploadKind } from '@prisma/client';

export type SavedUpload = {
  storageKey: string;
  checksumSha256: string;
};

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
]);

export function fileUploadsEnabled() {
  return process.env.ENABLE_FILE_UPLOADS === 'true';
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
    const storage = new Storage();
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

function safeExtension(fileName: string, mimeType: string) {
  const ext = path.extname(fileName).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp', '.pdf'].includes(ext)) return ext;
  if (mimeType === 'image/jpeg') return '.jpg';
  if (mimeType === 'image/png') return '.png';
  if (mimeType === 'image/webp') return '.webp';
  if (mimeType === 'application/pdf') return '.pdf';
  return '';
}
