import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/v3x.property/);
});

test('has login button', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Click the get started link.
    await page.getByRole('link', { name: 'Login' }).click();

    // Expects page to have a heading with the name of Installation.
    await expect(page.getByText('Sign in', { exact: true })).toBeVisible();
});
