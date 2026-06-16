import { cookies } from 'next/headers';
import { type Mode, MODE_COOKIE, normalizeMode } from './modes';

// Read the active department mode from the request cookie (server components only).
export function getServerMode(): Mode {
  return normalizeMode(cookies().get(MODE_COOKIE)?.value);
}
