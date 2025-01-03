import { expect, Page, test } from '@playwright/test';

import { DEFAULT_ITEM_NAME, WEB_URL } from './constants';

test('has title', async ({ page }) => {
    await page.goto(WEB_URL);

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/v3x.property/);
});

test.describe.serial('item flows', () => {
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
    });

    test('create an item', async () => {
        await page.goto(WEB_URL);

        await page.getByRole('link', { name: 'Create' }).click();

        let h1 = await page.locator('h1');

        await expect(h1).toHaveText('Create new Item');

        await page.getByTestId('generate-id-button').click();

        await page.waitForTimeout(500);

        const itemId = await page
            .getByTestId('new-item-id-input')
            .textContent();

        const newItemIdInput = await page
            .getByTestId('new-item-id-input')
            .inputValue();

        await page.getByTestId('create-button').click();

        h1 = await page.locator('h1');
        await expect(h1).toHaveText(`Edit Item ${newItemIdInput}`);

        expect(await page.getByRole('button', { name: 'Save' })).toBeDisabled();

        await page
            .getByRole('textbox', { name: 'Name' })
            .fill(DEFAULT_ITEM_NAME);

        await page.getByRole('button', { name: 'Save' }).click();

        // wait till navigated to /item/:itemId
        await page.waitForURL(WEB_URL + '/item/' + itemId);

        h1 = await page.locator('h1');
        await expect(h1).toHaveText(DEFAULT_ITEM_NAME, { timeout: 5000 });
    });

    test('search item', async () => {
        await page.goto(WEB_URL + '/search');

        await page.getByRole('link', { name: 'Search' }).click();

        await page.getByTestId('search-input').fill(DEFAULT_ITEM_NAME);

        await page.getByTestId('search-button').click();

        await page.waitForTimeout(300);

        await expect(page.getByTestId('search-results')).toBeVisible();

        await page.getByTestId('item-preview-large').first().click();

        await expect(page.locator('h1')).toHaveText(DEFAULT_ITEM_NAME);
    });

    test('delete item', async () => {
        await page.goto(WEB_URL);

        await page.getByRole('link', { name: 'Items' }).click();

        const preview = await page.getByTestId('item-preview-large').first();

        expect(preview).toBeVisible();

        await preview.click();

        await page.getByRole('link', { name: 'Edit' }).click();
        await page.getByRole('button', { name: 'Delete Item' }).click();
        await page.getByRole('button', { name: 'Yes, delete item' }).click();
    });
});
