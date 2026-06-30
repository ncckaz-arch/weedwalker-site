import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { readStoredPdf } from '@/lib/storage';

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token') || '';
    const disposition = url.searchParams.get('disposition') === 'inline' ? 'inline' : 'attachment';

    if (!token) {
      return NextResponse.json({ error: 'Document access token is required.' }, { status: 401 });
    }

    const document = await prisma.pdfDocument.findFirst({
      where: {
        id: params.id,
        accessToken: token,
        status: 'AVAILABLE'
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document is not available.' }, { status: 404 });
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Document download failed.' },
      { status: 400 }
    );
  }
}

function safeFileName(value: string) {
  return value.replace(/[^a-z0-9_.-]/gi, '-');
}
