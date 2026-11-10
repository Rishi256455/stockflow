import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const key = () => new TextEncoder().encode(process.env.AUTH_SECRET);

export async function createSession(user) {
  const token = await new SignJWT({ uid: user.id, oid: user.organizationId, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(key());
  cookies().set('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession() {
  const token = cookies().get('session')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return payload;
  } catch {
    return null;
  }
}

export async function requireSession() {
  const s = await getSession();
  if (!s) redirect('/login');
  return s;
}

export function destroySession() {
  cookies().delete('session');
}
