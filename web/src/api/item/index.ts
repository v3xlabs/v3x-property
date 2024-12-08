/* eslint-disable sonarjs/no-duplicate-string */
import {
    queryOptions,
    useMutation,
    UseMutationOptions,
    useQuery,
    UseQueryOptions,
} from '@tanstack/react-query';

import { useAuth } from '../auth';
import { apiRequest, BASE_URL, getHttp } from '../core';
import { paths } from '../schema.gen';

export type ApiItemResponse = {
    item_id: string;
    owner_id: number;
    product_id: number;
    name?: string;
    media?: number[];
    created?: string;
    modified?: string;
};

export const getItemById = (item_id: string) =>
    queryOptions({
        queryKey: ['item', '{item_id}', item_id],
        queryFn: async () => {
            const response = await apiRequest('/item/{item_id}', 'get', {
                path: { item_id },
            });

            return response.data;
        },
        retry: false,
    });

export const useItemById = (item_id: string) => {
    return useQuery(getItemById(item_id));
};

export const getOwnedItems = () =>
    queryOptions({
        queryKey: ['item', 'owned'],
        queryFn: async () => {
            const response = await apiRequest('/item/owned', 'get', {});

            return response.data;
        },
    });

export const useOwnedItems = () => {
    return useQuery(getOwnedItems());
};

export const getItemMedia = (item_id: string) =>
    queryOptions({
        queryKey: ['item', item_id, 'media'],
        queryFn: getHttp<number[]>('/api/item/' + item_id + '/media', {
            auth: 'include',
        }),
    });

export const useItemMedia = (item_id: string) => {
    return useQuery(getItemMedia(item_id));
};

export type ApiLogResponse =
    paths['/item/{item_id}/logs']['get']['responses']['200']['content']['application/json; charset=utf-8'];

export const getItemLogs = (
    item_id: string
): UseQueryOptions<ApiLogResponse> => ({
    queryKey: ['item', item_id, 'logs'],
    queryFn: getHttp('/api/item/' + item_id + '/logs', {
        auth: 'include',
    }),
});

export const useItemLogs = (item_id: string) => {
    return useQuery(getItemLogs(item_id));
};

// Create item
// This endpoint provisions the desired item_id with a placeholder item
export const useCreateItem = () => {
    return useMutation({
        mutationFn: async (item_id: string) =>
            fetch(BASE_URL + '/api/item?item_id=' + item_id, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + useAuth.getState().token,
                },
            }).then((response) => response.ok),
    });
};

// Delete item
// This endpoint deletes the item from the database and the search index.
export const useDeleteItem = (
    options?: UseMutationOptions<boolean, Error, string>
) => {
    const { clearAuthToken } = useAuth();

    return useMutation({
        mutationFn: async (item_id: string) => {
            const response = await fetch(BASE_URL + '/api/item/' + item_id, {
                method: 'DELETE',
                headers: {
                    Authorization: 'Bearer ' + useAuth.getState().token,
                },
            });

            if (response.status === 401) {
                console.log('Token expired, clearing token');
                clearAuthToken();

                throw new Error('Token expired');
            }

            return response.ok;
        },
        ...options,
    });
};

// Edit item
export const useEditItem = () => {
    return useMutation({
        mutationFn: async ({
            item_id,
            data,
        }: {
            item_id: string;
            data: paths['/item/{item_id}']['patch']['requestBody']['content']['application/json; charset=utf-8'];
        }) => {
            const response = await fetch(BASE_URL + '/api/item/' + item_id, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + useAuth.getState().token,
                },
                body: JSON.stringify(data),
            });

            return response.ok;
        },
    });
};
