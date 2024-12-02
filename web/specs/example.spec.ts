import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/v3x.property/);
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

test('search item', async ({ page }) => {
    await page.goto('http://localhost:5173/search');

    await page.getByTestId('search-navlink').click();

    await page.getByTestId('search-input').fill('A New Item');

    await page.getByTestId('search-button').click();

    await expect(page.getByTestId('search-results')).toBeVisible();

    await page.getByTestId('item-preview-full').click();

    await expect(page.locator('h1')).toHaveText('A New Item');
});

test('delete item', async ({ page }) => {
    await page.goto('http://localhost:5173');

    await page.getByTestId('items-navlink').click();

    await page.getByRole('link', { name: 'View' }).first().click();
    await page.getByRole('link', { name: 'Edit' }).click();
    await page.getByRole('button', { name: 'Delete Item' }).click();
    await page.getByRole('button', { name: 'Yes, delete item' }).click();
});
