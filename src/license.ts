const SLUG = 'spoken-dev-brief';
const API = 'https://api.sociobot.in/api/v1';
const TOKEN_KEY = `sb_license:${SLUG}`;
const CACHE_KEY = `sb_license_cache:${SLUG}`;

export function captureLicense(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
  url.searchParams.delete('license');
  history.replaceState({}, '', url.pathname + url.search + url.hash);
}

export function saveLicense(token: string): void {
  localStorage.setItem(TOKEN_KEY, token.trim());
  localStorage.removeItem(CACHE_KEY);
}

export function cachedLicensed(): boolean {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    return cache.valid === true;
  } catch { return false; }
}

export async function verifyLicense(): Promise<boolean> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  let old: { valid?: boolean; checkedAt?: number } = {};
  try { old = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { localStorage.removeItem(CACHE_KEY); }
  if (old.checkedAt && Date.now() - old.checkedAt < 86_400_000) return old.valid === true;
  try {
    const response = await fetch(`${API}/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    const data = await response.json() as { valid: boolean };
    localStorage.setItem(CACHE_KEY, JSON.stringify({ valid: data.valid, checkedAt: Date.now() }));
    return data.valid;
  } catch { return old.valid === true; }
}

export const checkoutUrl = `${API}/products/${SLUG}/checkout`;
