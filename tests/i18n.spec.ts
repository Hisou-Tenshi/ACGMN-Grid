import { test, expect } from '@playwright/test';

const locales = ['zh-CN','zh-TW','en','ja','ko','fr','de','es','pt','it','ru','nl','pl','tr'];

for (const locale of locales) {
  test(`renders home for ${locale}`, async ({ page }) => {
    await page.goto(`/${locale}`);

    // Main canvas should exist
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // It should be keyboard reachable for accessibility
    await expect(canvas).toHaveAttribute('role', 'img');
    await expect(canvas).toHaveAttribute('tabindex', '0');

    // Generate button visible
    const button = page.getByRole('button').first();
    await expect(button).toBeVisible();

    // No horizontal overflow at the document level
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth - document.documentElement.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
