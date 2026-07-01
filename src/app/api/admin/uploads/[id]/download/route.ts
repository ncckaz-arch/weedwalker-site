import { NextResponse } from 'next/server';
import { requireCurrentAdminUser } from '@/lib/admin';
import { prisma } from '@/lib/db';
import { readStoredUpload } from '@/lib/storage';

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireCurrentAdminUser();
    const url = new URL(request.url);
    const disposition = url.searchParams.get('disposition') === 'inline' ? 'inline' : 'attachment';

    const upload = await prisma.uploadedDocument.findUnique({
      where: { id: params.id }
    });

    if (!upload || (!upload.storageKey && !upload.contentBytes)) {
      return NextResponse.json({ error: 'Uploaded file is not available.' }, { status: 404 });
    }

    const buffer = await readStoredUpload({
      storageKey: upload.storageKey,
      contentBytes: upload.contentBytes
    });
    const fileName = safeFileName(upload.originalName || `${upload.kind}-${upload.id}`);

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': upload.mimeType || 'application/octet-stream',
        'Content-Disposition': `${disposition}; filename="${fileName}"`
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Google verification is required.' }, { status: 401 });
    }

    if (error instanceof Error && error.message === 'ADMIN_REQUIRED') {
      return NextResponse.json({ error: 'Admin access is required.' }, { status: 403 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Uploaded file download failed.' },
      { status: 400 }
    );
  }
}

function safeFileName(value: string) {
  return value.replace(/[^a-z0-9_.-]/gi, '-');
}
