import { NextResponse } from 'next/server';
import { createSessionToken, setSessionCookie, verifyGoogleCredential } from '@/lib/auth';

function authRedirect(request: Request, reason?: string) {
  const requestUrl = new URL(request.url);
  const url = new URL(safeReturnPath(requestUrl.searchParams.get('returnTo')), request.url);
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

function safeReturnPath(value: string | null) {
  if (!value || !value.startsWith('/')) return '/member';
  if (value.startsWith('//')) return '/member';

  const [pathWithQuery] = value.split('#');
  const path = pathWithQuery.split('?')[0];
  const allowedPaths = ['/member', '/admin'];

  return allowedPaths.includes(path) ? pathWithQuery : '/member';
}
