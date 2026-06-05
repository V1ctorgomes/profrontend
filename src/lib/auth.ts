import { cookies } from 'next/headers';
import type { User } from '@/types/auth';
import { AUTH_COOKIE, USER_COOKIE } from '@/lib/constants';

export { AUTH_COOKIE, USER_COOKIE };

export async function getServerToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value;
}

export async function getServerUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(USER_COOKIE)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(decodeURIComponent(raw)) as User;
  } catch {
    return null;
  }
}

export { formatCurrency } from '@/lib/format';
