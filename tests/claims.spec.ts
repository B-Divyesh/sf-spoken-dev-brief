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
  await page.locator('#transcript').fill('We decided to store events in SQLite. Assume the data directory is writable. Should we encrypt exports?');
  await page.getByRole('button', { name: 'Draft brief locally' }).click();
  await expect(page.getByRole('group', { name: 'Decisions' }).locator('textarea')).toHaveValue('We decided to store events in SQLite');
  await expect(page.getByRole('group', { name: 'Assumptions' }).locator('textarea')).toHaveValue('Assume the data directory is writable');
  await expect(page.getByRole('group', { name: 'Open questions' }).locator('textarea')).toHaveValue('Should we encrypt exports');
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
  await page.goto('/demo'); await page.getByRole('button', { name: 'Copy Jira text' }).click();
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
test('@claim:pro-price shows the price and hosted checkout', async ({ page }) => {
  await page.goto('/'); await expect(page.getByText('$12', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy Pro' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/spoken-dev-brief/checkout');
});
test('@claim:license-verify restores a valid license', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/spoken-dev-brief/verify?license=test-license', route => route.fulfill({ json: { valid: true, reason: 'ok', expires_at: '2026-10-01' } }));
  await page.goto('/'); await page.getByRole('button', { name: 'Have a license? Paste it' }).click();
  await page.getByLabel('License token').fill('test-license'); await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByRole('status')).toContainText('License verified');
});
