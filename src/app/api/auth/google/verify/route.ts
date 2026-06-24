import { NextResponse } from 'next/server';
import { createSessionToken, setSessionCookie, verifyGoogleCredential } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    if (process.env.ENABLE_GOOGLE_LOGIN !== 'true') {
      return NextResponse.json({ error: 'Google Login is disabled for first launch.' }, { status: 503 });
    }

    const body = await request.json();
    const credential = body?.credential;
    if (typeof credential !== 'string' || credential.length < 20) {
      return NextResponse.json({ error: 'Missing Google credential.' }, { status: 400 });
    }

    const user = await verifyGoogleCredential(credential);
    const token = await createSessionToken(user.id);
    setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        memberProfile: user.memberProfile
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Google verification failed.' },
      { status: 401 }
    );
  }
}
