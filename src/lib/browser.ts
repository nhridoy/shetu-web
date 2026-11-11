import type { ReleaseCache } from './github';

export function sessionCache(): ReleaseCache | null {
  try {
    if (typeof sessionStorage === 'undefined') return null;
    return sessionStorage;
  } catch {
    return null;
  }
}
