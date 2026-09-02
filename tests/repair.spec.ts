import { test, expect } from '@playwright/test';

test('unconfirmed Markdown and Jira exports are blocked', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('button', { name: 'Download Markdown' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Copy Jira text' })).toBeDisabled();
  let downloads = 0; page.on('download', () => downloads++);
  await page.getByRole('button', { name: 'Download Markdown' }).press('Enter');
  expect(downloads).toBe(0);
});

test('editing a confirmed brief requires confirmation again', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('I checked this brief against the recording.').check();
  await page.getByRole('button', { name: 'Confirm brief' }).click();
  await expect(page.getByRole('button', { name: 'Download Markdown' })).toBeEnabled();
  await page.getByLabel('Brief title').fill('Changed after confirmation');
  await page.getByLabel('Brief title').press('Tab');
  await expect(page.getByRole('button', { name: 'Download Markdown' })).toBeDisabled();
});

test('malformed saved JSON is removed and recovery stays usable', async ({ page }) => {
  await page.goto('/app');
  await page.evaluate(() => localStorage.setItem('real:spoken-dev-brief:brief', '{'));
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review a spoken engineering brief');
  await expect(page.getByRole('alert')).toContainText('damaged saved brief was removed');
  await expect(page.getByRole('heading', { name: 'No brief yet' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('real:spoken-dev-brief:brief'))).toBeNull();
});

test('route canonicals and Back and Forward focus follow the current page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy', exact: true }).first().click();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://spoken-dev-brief.sociobot.in/privacy');
  await page.goBack();
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://spoken-dev-brief.sociobot.in/');
  await page.goForward();
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://spoken-dev-brief.sociobot.in/privacy');
});

test('visible mobile navigation and footer targets are at least 44px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/privacy');
  const undersized = await page.locator('.site-header a, footer a').evaluateAll(elements => elements.flatMap(element => {
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return [];
    return rect.width >= 44 && rect.height >= 44 ? [] : [{ text: element.textContent?.trim(), width: rect.width, height: rect.height }];
  }));
  expect(undersized).toEqual([]);
});

test('the 320px demo does not scroll sideways', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/demo');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test('keyboard-only confirmation enables export', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('I checked this brief against the recording.').focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Confirm brief' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Download Markdown' })).toBeEnabled();
  await page.getByRole('button', { name: 'Download Markdown' }).focus();
  const download = page.waitForEvent('download');
  await page.keyboard.press('Enter');
  await download;
});

test('service worker update keeps only the current offline cache', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/demo');
  const state = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return { active: registration.active?.state, caches: await caches.keys() };
  });
  expect(state.active).toBe('activated');
  expect(state.caches).toContain('spoken-dev-brief-v2');
  expect(state.caches).not.toContain('spoken-dev-brief-v1');
  await context.close();
});

test('workspace text can resize to 200% without horizontal loss', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download Markdown' })).toBeVisible();
});
