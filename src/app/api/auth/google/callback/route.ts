import { NextResponse } from 'next/server';
import { createSessionToken, setSessionCookie, verifyGoogleCredential } from '@/lib/auth';

function authRedirect(request: Request, reason?: string) {
  const url = new URL('/auth/redirect', request.url);
  if (reason) {
    url.searchParams.set('auth', reason);
  }
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  try {
    if (process.env.ENABLE_GOOGLE_LOGIN !== 'true') {
      return authRedirect(request, 'disabled');
    }

    const formData = await request.formData();
    const credential = formData.get('credential');

    if (typeof credential !== 'string' || credential.length < 20) {
      return authRedirect(request, 'missing_credential');
    }

    const user = await verifyGoogleCredential(credential);
    const token = await createSessionToken(user.id);
    setSessionCookie(token);

    return authRedirect(request);
  } catch (error) {
    console.error('Google callback failed', error);
    return authRedirect(request, 'failed');
  }
}

export async function GET(request: Request) {
  return authRedirect(request);
}
