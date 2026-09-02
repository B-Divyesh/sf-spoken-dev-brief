import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for (const path of ['/', '/app', '/demo', '/privacy', '/terms', '/qa-missing']) test(`accessibility baseline ${path}`, async ({ page }) => {
  await page.goto(path); await expect(page.locator('h1')).toHaveCount(1);
  const results = await new AxeBuilder({ page: page as never }).analyze(); expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact || ''))).toEqual([]);
});
test('mobile workspace fits a 390px screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/demo');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= 390)).toBeTruthy();
  await expect(page.getByRole('button', { name: 'Download Markdown' })).toBeVisible();
});
