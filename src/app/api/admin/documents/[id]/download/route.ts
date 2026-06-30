import { NextResponse } from 'next/server';
import { requireCurrentAdminUser } from '@/lib/admin';
import { prisma } from '@/lib/db';
import { readStoredPdf } from '@/lib/storage';

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireCurrentAdminUser();
    const url = new URL(request.url);
    const disposition = url.searchParams.get('disposition') === 'inline' ? 'inline' : 'attachment';

    const document = await prisma.pdfDocument.findUnique({
      where: { id: params.id }
    });

    if (!document || (!document.storageKey && !document.contentBytes)) {
      return NextResponse.json({ error: 'Document is not generated yet.' }, { status: 404 });
    }

    const buffer = await readStoredPdf({
      storageKey: document.storageKey,
      contentBytes: document.contentBytes
    });
    const fileName = safeFileName(`${document.documentType}-${document.id}.pdf`);

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
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
      { error: error instanceof Error ? error.message : 'Document download failed.' },
      { status: 400 }
    );
  }
}

function safeFileName(value: string) {
  return value.replace(/[^a-z0-9_.-]/gi, '-');
}
