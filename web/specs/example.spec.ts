import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/v3x.property/);
});

test('has login button', async ({ page }) => {
    await page.goto('http://localhost:5173/items');

    // Click the get started link.
    await page.getByRole('link', { name: 'Login' }).click();

    // Expects page to have a heading with the name of Installation.
    await expect(
        page.getByRole('heading', { name: 'Sign in to your account' })
    ).toBeVisible();

    await page.getByLabel('Username or email').fill('user');
    await page.getByRole('textbox', { name: 'password' }).fill('wachtwoord');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByTestId('user-dropdown-trigger')).toBeVisible();

    await expect(page.getByTestId('user-dropdown-name')).toContainText(
        'John Doe'
    );
});

test('create an item', async ({ page }) => {
    await page.goto('http://localhost:5173');

    await page.getByTestId('create-navlink').click();

    let h1 = await page.locator('h1');

    await expect(h1).toHaveText('Create new Item');

    await page.getByTestId('generate-id-button').click();

    const newItemIdInput = await page
        .getByTestId('new-item-id-input')
        .inputValue();

    await page.getByTestId('create-button').click();

    h1 = await page.locator('h1');
    await expect(h1).toHaveText(`Edit Item ${newItemIdInput}`);
});

test('delete item', async ({ page }) => {
    await page.goto('http://localhost:5173');

    await page.getByTestId('items-navlink').click();

    await page.getByRole('link', { name: 'View' }).first().click();
    await page.getByRole('link', { name: 'Edit' }).click();
    await page.getByRole('button', { name: 'Delete Item' }).click();
    await page.getByRole('button', { name: 'Yes, delete item' }).click();
});
