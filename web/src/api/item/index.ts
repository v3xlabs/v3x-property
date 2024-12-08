/* eslint-disable sonarjs/no-duplicate-string */
import { apiRequest, ApiRoute, createMutation, createQuery } from '../core';

export const useItemById = createQuery({
    queryKey: ['item'],
    fetcher: async ({ item_id }: { item_id: string }) => {
        const response = await apiRequest('/item/{item_id}', 'get', {
            path: { item_id },
        });

        return response.data;
    },
});

export const useOwnedItems = createQuery({
    queryKey: ['item', 'owned'],
    fetcher: async () => {
        const response = await apiRequest('/item/owned', 'get', {});

        return response.data;
    },
    retry: false,
});

export const useItemMedia = createQuery({
    queryKey: ['item', 'media'],
    fetcher: async ({ item_id }: { item_id: string }) => {
        const response = await apiRequest('/item/{item_id}/media', 'get', {
            path: { item_id },
        });

        return response.data;
    },
});

export const useItemLogs = createQuery({
    queryKey: ['item', 'logs'],
    fetcher: async ({ item_id }: { item_id: string }) => {
        const response = await apiRequest('/item/{item_id}/logs', 'get', {
            path: { item_id },
        });

        return response.data;
    },
});

// Create item
// This endpoint provisions the desired item_id with a placeholder item
export const useCreateItem = createMutation({
    mutationKey: ['item', 'create'],
    mutationFn: async ({ item_id }: { item_id: string }) => {
        const response = await apiRequest('/item', 'post', {
            query: { item_id },
        });

        return response.data;
    },
});

// Delete item
// This endpoint deletes the item from the database and the search index.
export const useDeleteItem = createMutation({
    mutationKey: ['item', 'delete'],
    mutationFn: async ({ item_id }: { item_id: string }) => {
        await apiRequest('/item/{item_id}', 'delete', {
            path: { item_id },
        });

        return true;
    },
});

// Edit item
export const useEditItem = createMutation({
    mutationKey: ['item', 'edit'],
    mutationFn: async ({
        item_id,
        data,
    }: {
        item_id: string;
        data: ApiRoute<'/item/{item_id}', 'patch'>['body']['data'];
    }) => {
        await apiRequest('/item/{item_id}', 'patch', {
            path: { item_id },
            contentType: 'application/json; charset=utf-8',
            data,
        });

        return true;
    },
});
