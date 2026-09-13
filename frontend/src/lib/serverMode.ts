import { type Mode, DEFAULT_MODE } from './modes';

// Electronics is hidden for now — the storefront is fashion-only. Always report
// fashion, ignoring any `cs_mode` cookie, so a stale `cs_mode=electronics` cookie
// (set before the department toggle was removed) can't trap a user in an empty store.
export function getServerMode(): Mode {
  return DEFAULT_MODE;
}
