import { test, expect } from '@playwright/test';
test('@claim:demo-sandbox sample data uses an isolated namespace', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('#brief-name')).toHaveValue('Keep sync retries capped at three attempts');
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys.some(k => k.startsWith('demo:spoken-dev-brief:'))).toBeTruthy();
  expect(keys.some(k => k.startsWith('real:spoken-dev-brief:'))).toBeFalsy();
});
test('@claim:local-draft drafts a structured brief without an account', async ({ page }) => {
  await page.goto('/app');
  await page.locator('#transcript').fill('We decided to store events in src/db/events.ts:12. Assume the data directory is writable. Should we change src/config/storage.ts? Priya Shah owns the follow-up.');
  await page.getByRole('button', { name: 'Draft brief locally' }).click();
  await expect(page.getByRole('group', { name: 'Decisions' }).locator('textarea')).toHaveValue('We decided to store events in src/db/events.ts:12');
  await expect(page.getByRole('group', { name: 'Assumptions' }).locator('textarea')).toHaveValue('Assume the data directory is writable');
  await expect(page.getByRole('group', { name: 'Open questions' }).locator('textarea')).toHaveValue('Should we change src/config/storage.ts');
  await expect(page.getByLabel('Owner', { exact: true })).toHaveValue('Priya Shah');
  await expect(page.getByLabel('Repository path 1')).toHaveValue('src/db/events.ts:12');
  await expect(page.getByLabel('Repository path 2')).toHaveValue('src/config/storage.ts');
});
test('@claim:markdown-export downloads the confirmed brief as Markdown', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('I checked this brief against the recording.').check();
  await page.getByRole('button', { name: 'Confirm brief' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download Markdown' }).click();
  const download = await downloadPromise;
  const chunks: Buffer[] = []; for await (const chunk of await download.createReadStream()) chunks.push(Buffer.from(chunk));
  const text = Buffer.concat(chunks).toString();
  expect(text).toContain('**Status:** Confirmed'); expect(text).toContain('`src/lib/sync.ts:48`');
});
test('@claim:jira-export copies Jira-formatted text', async ({ browser }) => {
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] }); const page = await context.newPage();
  await page.goto('/demo'); await page.getByLabel('I checked this brief against the recording.').check(); await page.getByRole('button', { name: 'Confirm brief' }).click(); await page.getByRole('button', { name: 'Copy Jira text' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('h2. Decisions'); await context.close();
});
test('@claim:device-private demo workflow contacts only this site', async ({ page }) => {
  const origins = new Set<string>(); page.on('request', req => origins.add(new URL(req.url()).origin));
  await page.goto('/demo'); await page.getByRole('button', { name: 'Reset demo' }).click(); await page.getByRole('button', { name: 'Draft brief locally' }).click();
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
});
test('@claim:offline-reload demo reloads after the first visit', async ({ browser }) => {
  const context = await browser.newContext(); const page = await context.newPage(); await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready); await page.reload(); await context.setOffline(true); await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review a spoken engineering brief'); await context.close();
});
test('@claim:consent-required recording stays blocked until consent is marked', async ({ page }) => {
  await page.goto('/app'); await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('status')).toContainText('Consent is not marked');
});
test('@claim:retention expired local briefs are removed', async ({ page }) => {
  await page.goto('/app');
  await page.evaluate(() => {
    localStorage.setItem('real:spoken-dev-brief:settings', JSON.stringify({ author: '', retentionDays: 7, deleteAudioAfterTranscription: true }));
    localStorage.setItem('real:spoken-dev-brief:brief', JSON.stringify({ id:'old', title:'Old brief', author:'Maya', createdAt:'2020-01-01T00:00:00.000Z', transcript:'Old', decisions:['Old'], assumptions:[], questions:[], references:[], status:'draft' }));
  });
  await page.reload(); await expect(page.getByRole('heading', { name: 'No brief yet' })).toBeVisible();
});
test('@claim:pro-price shows the price and a truthful unavailable checkout', async ({ page }) => {
  await page.goto('/'); await expect(page.getByText('$12', { exact: true })).toBeVisible();
  const checkout = page.getByRole('link', { name: 'Checkout unavailable' });
  await expect(checkout).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/spoken-dev-brief/checkout');
  await expect(checkout).toHaveAttribute('aria-disabled', 'true');
  await checkout.evaluate((element: HTMLAnchorElement) => element.click());
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('status')).toContainText('Purchase registration is pending');
});

test('@claim:no-covert-recording never opens a microphone before consent', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, '__TAURI_INTERNALS__', { value: {} });
    Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia: () => { sessionStorage.setItem('microphone-called', 'yes'); return Promise.reject(new Error('blocked')); } } });
  });
  await page.goto('/app');
  expect(await page.evaluate(() => sessionStorage.getItem('microphone-called'))).toBeNull();
  await page.getByRole('button', { name: 'Start recording' }).click();
  expect(await page.evaluate(() => sessionStorage.getItem('microphone-called'))).toBeNull();
  await expect(page.getByRole('status')).toContainText('Consent is not marked');
});

test('@claim:no-people-scoring drafts record fields without scores or rankings', async ({ page }) => {
  await page.goto('/app');
  await page.locator('#transcript').fill('We decided to keep the retry limit. Maya owns the follow-up.');
  await page.getByRole('button', { name: 'Draft brief locally' }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('real:spoken-dev-brief:brief') || '{}'));
  expect(Object.keys(saved).sort()).toEqual(['assumptions', 'author', 'createdAt', 'decisions', 'id', 'questions', 'references', 'status', 'title', 'transcript']);
  expect(JSON.stringify(saved)).not.toMatch(/score|rank|rating/i);
});

test('@claim:no-code-writing creates only local brief data', async ({ page }) => {
  const writes: string[] = [];
  page.on('request', request => { if (!['GET', 'HEAD'].includes(request.method())) writes.push(request.url()); });
  await page.goto('/app');
  await page.locator('#transcript').fill('We decided to edit src/lib/sync.ts. Maya owns the follow-up.');
  await page.getByRole('button', { name: 'Draft brief locally' }).click();
  expect(writes).toEqual([]);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(['real:spoken-dev-brief:brief']);
  await expect(page.getByLabel('Repository path 1')).toHaveValue('src/lib/sync.ts');
});

test('@claim:no-model-training sends no transcript outside this site', async ({ page }) => {
  const origins = new Set<string>(); page.on('request', request => origins.add(new URL(request.url()).origin));
  await page.goto('/app');
  await page.locator('#transcript').fill('We decided to keep the local queue in src/queue.ts.');
  await page.getByRole('button', { name: 'Draft brief locally' }).click();
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
});

test('@claim:no-analytics loads no analytics or tracking endpoint', async ({ page }) => {
  const urls: string[] = []; page.on('request', request => urls.push(request.url()));
  await page.goto('/demo'); await page.goto('/privacy'); await page.goto('/terms');
  expect(urls.every(url => new URL(url).origin === 'http://127.0.0.1:4173')).toBeTruthy();
  expect(urls.join('\n')).not.toMatch(/analytics|telemetry|segment|plausible|google-analytics/i);
});
test('@claim:license-verify restores a valid license', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/spoken-dev-brief/verify?license=test-license', route => route.fulfill({ json: { valid: true, reason: 'ok', expires_at: '2026-10-01' } }));
  await page.goto('/'); await page.getByRole('button', { name: 'Have a license? Paste it' }).click();
  await page.getByLabel('License token').fill('test-license'); await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByRole('status')).toContainText('License verified');
});
