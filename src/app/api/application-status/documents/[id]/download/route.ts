import { readFile } from 'fs/promises';
import path from 'path';
import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { googleStorageOptions } from '@/lib/storage';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireCurrentUser();
    const document = await prisma.pdfDocument.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        status: 'AVAILABLE'
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document is not available.' }, { status: 404 });
    }

    const fileName = safeFileName(`${document.documentType}-${document.id}.pdf`);
    const bucketName = process.env.GCS_BUCKET_NAME;

    if (bucketName) {
      const storage = new Storage(googleStorageOptions());
      const file = storage.bucket(bucketName).file(document.storageKey);
      const [buffer] = await file.download();

      return new Response(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`
        }
      });
    }

    if (process.env.NODE_ENV !== 'production') {
      const localRoot = process.env.LOCAL_UPLOAD_DIR || './data/uploads';
      const root = path.resolve(process.cwd(), localRoot);
      const filePath = path.resolve(root, document.storageKey);

      if (!filePath.startsWith(root)) {
        return NextResponse.json({ error: 'Invalid document path.' }, { status: 400 });
      }

      const buffer = await readFile(filePath);
      return new Response(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`
        }
      });
    }

    return NextResponse.json({ error: 'Document storage is not configured.' }, { status: 503 });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Google verification is required.' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Document download failed.' },
      { status: 400 }
    );
  }
}

function safeFileName(value: string) {
  return value.replace(/[^a-z0-9_.-]/gi, '-');
}
