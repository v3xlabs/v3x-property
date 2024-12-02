import test, { expect } from '@playwright/test';

test('has login button', async ({ page }) => {
    await page.goto('http://localhost:5173/items');
    await page.waitForLoadState('domcontentloaded');

    const signFlow = await Promise.race([
        (async () => {
            await page.waitForSelector('[data-testid="login-button"]', {
                timeout: 2000,
                strict: false,
            });

            return 'sign-in';
        })(),
        (async () => {
            await page.waitForSelector('[data-testid="user-dropdown-name"]', {
                strict: false,
                timeout: 2000,
            });

            return 'signed-in';
        })(),
    ]);

    if (signFlow === 'sign-in') {
        await page.getByRole('link', { name: 'Login' }).click();
        await page.waitForSelector('#kc-page-title', {
            timeout: 2000,
        });

        await page.getByLabel('Username or email').fill('user');
        await page
            .getByRole('textbox', { name: 'password' })
            .fill('wachtwoord');
        await page.getByRole('button', { name: 'Sign In' }).click();

        await page.waitForLoadState('domcontentloaded');
    }

    await expect(page.getByTestId('user-dropdown-trigger')).toBeVisible();

    await expect(page.getByTestId('user-dropdown-name')).toContainText(
        'John Doe'
    );

    await page.context().storageState({ path: './playwright/.auth/user.json' });
});
