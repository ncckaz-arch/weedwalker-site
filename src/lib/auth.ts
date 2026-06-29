import { cookies } from 'next/headers';
import { OAuth2Client } from 'google-auth-library';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from '@/lib/db';

const COOKIE_NAME = 'ww_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters.');
  }
  return new TextEncoder().encode(secret);
}

export async function verifyGoogleCredential(credential: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is missing.');
  }

  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: clientId
  });
  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email) {
    throw new Error('Google credential does not include required identity fields.');
  }

  const emailVerifiedAt = payload.email_verified ? new Date() : null;

  const existingGoogleUser = await prisma.user.findUnique({
    where: { googleSub: payload.sub },
    include: { memberProfile: true }
  });

  if (existingGoogleUser) {
    return prisma.user.update({
      where: { id: existingGoogleUser.id },
      data: {
        email: payload.email,
        name: payload.name,
        image: payload.picture,
        emailVerifiedAt
      },
      include: { memberProfile: true }
    });
  }

  if (payload.email_verified) {
    const existingEmailUser = await prisma.user.findUnique({
      where: { email: payload.email },
      include: { memberProfile: true }
    });

    if (existingEmailUser) {
      return prisma.user.update({
        where: { id: existingEmailUser.id },
        data: {
          googleSub: payload.sub,
          name: payload.name,
          image: payload.picture,
          emailVerifiedAt
        },
        include: { memberProfile: true }
      });
    }
  }

  const user = await prisma.user.create({
    data: {
      googleSub: payload.sub,
      email: payload.email,
      name: payload.name,
      image: payload.picture,
      emailVerifiedAt
    },
    include: { memberProfile: true }
  });

  return user;
}

export async function createSessionToken(userId: string) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSessionSecret());
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const verified = await jwtVerify(token, getSessionSecret());
    const userId = verified.payload.userId;
    if (typeof userId !== 'string') return null;

    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberProfile: true,
        pdfDocuments: {
          where: { status: 'AVAILABLE' },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  } catch {
    return null;
  }
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('AUTH_REQUIRED');
  }
  return user;
}
