import { AUTH_COOKIE, USER_COOKIE } from '@/lib/constants';
import type { User } from '@/types/auth';

export function getClientToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${AUTH_COOKIE}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function getClientUser(): User | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${USER_COOKIE}=([^;]*)`),
  );
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as User;
  } catch {
    return null;
  }
}
