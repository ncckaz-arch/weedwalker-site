import { getCurrentUser, requireCurrentUser } from '@/lib/auth';

export function adminEmails() {
  return [
    ...(process.env.ADMIN_EMAILS || '').split(','),
    process.env.ADMIN_EMAIL || ''
  ]
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function getCurrentAdminUser() {
  const user = await getCurrentUser();
  if (!user) return null;

  const allowed = adminEmails();
  if (allowed.length === 0) return null;

  return allowed.includes(user.email.toLowerCase()) ? user : null;
}

export async function requireCurrentAdminUser() {
  const user = await requireCurrentUser();
  const allowed = adminEmails();

  if (allowed.length === 0 || !allowed.includes(user.email.toLowerCase())) {
    throw new Error('ADMIN_REQUIRED');
  }

  return user;
}
