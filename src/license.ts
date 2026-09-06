const SLUG = 'spoken-dev-brief';
const API = 'https://api.sociobot.in/api/v1';
const TOKEN_KEY = `sb_license:${SLUG}`;
const CACHE_KEY = `sb_license_cache:${SLUG}`;
const DAY = 86_400_000;

export type LicenseReason = 'ok' | 'invalid' | 'expired' | 'revoked' | 'wrong_product' | 'offline' | 'missing';

export interface LicenseStatus {
  valid: boolean;
  reason: LicenseReason;
  checkedAt: number;
  expiresAt?: string | null;
}

function cachedStatus(): LicenseStatus | null {
  try {
    const value = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null') as Partial<LicenseStatus> | null;
    if (!value || typeof value.valid !== 'boolean' || typeof value.checkedAt !== 'number') return null;
    return {
      valid: value.valid,
      reason: typeof value.reason === 'string' ? value.reason as LicenseReason : value.valid ? 'ok' : 'invalid',
      checkedAt: value.checkedAt,
      expiresAt: typeof value.expiresAt === 'string' ? value.expiresAt : null,
    };
  } catch {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

export function captureLicense(): boolean {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return false;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.removeItem(CACHE_KEY);
  url.searchParams.delete('license');
  history.replaceState({}, '', url.pathname + url.search + url.hash);
  return true;
}

export function saveLicense(token: string): void {
  localStorage.setItem(TOKEN_KEY, token.trim());
  localStorage.removeItem(CACHE_KEY);
}

export function cachedLicensed(): boolean {
  return cachedStatus()?.valid === true;
}

export async function verifyLicense(): Promise<LicenseStatus> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return { valid: false, reason: 'missing', checkedAt: Date.now() };
  const old = cachedStatus();
  if (old && Date.now() - old.checkedAt < DAY) return old;
  try {
    const response = await fetch(`${API}/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    const data = await response.json() as { valid?: boolean; reason?: LicenseReason; expires_at?: string | null };
    const status: LicenseStatus = {
      valid: data.valid === true,
      reason: data.valid === true ? 'ok' : data.reason || 'invalid',
      checkedAt: Date.now(),
      expiresAt: data.expires_at,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(status));
    return status;
  } catch {
    return old?.valid ? { ...old, reason: 'offline' } : { valid: false, reason: 'offline', checkedAt: Date.now() };
  }
}

export const checkoutUrl = `${API}/products/${SLUG}/checkout`;
