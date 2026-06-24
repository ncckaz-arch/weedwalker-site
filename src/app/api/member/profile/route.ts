import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireCurrentUser } from '@/lib/auth';
import { memberProfileSchema } from '@/lib/validators';

export async function GET() {
  try {
    if (process.env.ENABLE_GOOGLE_LOGIN !== 'true') {
      return NextResponse.json({ error: 'Member protected access is disabled for first launch.' }, { status: 503 });
    }

    const user = await requireCurrentUser();
    return NextResponse.json({
      profile: user.memberProfile,
      pdfDocuments: user.pdfDocuments
    });
  } catch {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    if (process.env.ENABLE_GOOGLE_LOGIN !== 'true') {
      return NextResponse.json({ error: 'Member protected access is disabled for first launch.' }, { status: 503 });
    }

    const user = await requireCurrentUser();
    const parsed = memberProfileSchema.parse(await request.json());

    const profile = await prisma.memberProfile.upsert({
      where: { userId: user.id },
      update: {
        displayName: parsed.displayName,
        phone: parsed.phone || null,
        lineUserId: parsed.lineUserId || null,
        preferredLanguage: parsed.preferredLanguage,
        profileStatus: 'active'
      },
      create: {
        userId: user.id,
        displayName: parsed.displayName,
        phone: parsed.phone || null,
        lineUserId: parsed.lineUserId || null,
        preferredLanguage: parsed.preferredLanguage,
        profileStatus: 'active'
      }
    });

    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Profile update failed.' },
      { status: 400 }
    );
  }
}
