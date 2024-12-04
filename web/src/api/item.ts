/* eslint-disable sonarjs/no-duplicate-string */
import {
    queryOptions,
    useMutation,
    UseMutationOptions,
    useQuery,
    UseQueryOptions,
} from '@tanstack/react-query';

import { useAuth } from './auth';
import { BASE_URL, getHttp } from './core';
import { paths } from './schema.gen';

export type ApiItemResponse = {
    item_id: string;
    owner_id: number;
    product_id: number;
    name?: string;
    media?: number[];
    created?: string;
    modified?: string;
};

export const itemByIdQueryOptions = (item_id: string) =>
    queryOptions({
        queryKey: ['item', item_id],
        queryFn: getHttp<ApiItemResponse>('/api/item/' + item_id, {
            auth: 'include',
        }),
    });

export const useApiItemById = (item_id: string) => {
    return useQuery(itemByIdQueryOptions(item_id));
};

export const getApiOwnedItems = (): UseQueryOptions<ApiItemResponse[]> => ({
    queryKey: ['item', 'owned'],
    queryFn: getHttp('/api/item/owned', {
        auth: 'include',
    }),
});

export const useApiOwnedItems = () => {
    return useQuery(getApiOwnedItems());
};

export const itemMediaQueryOptions = (item_id: string) =>
    queryOptions({
        queryKey: ['item', item_id, 'media'],
        queryFn: getHttp<number[]>('/api/item/' + item_id + '/media', {
            auth: 'include',
        }),
    });

export type ApiLogResponse =
    paths['/item/{item_id}/logs']['get']['responses']['200']['content']['application/json; charset=utf-8'];

export const getApiItemLogs = (
    item_id: string
): UseQueryOptions<ApiLogResponse> => ({
    queryKey: ['item', item_id, 'logs'],
    queryFn: getHttp('/api/item/' + item_id + '/logs', {
        auth: 'include',
    }),
});

export const useApiItemLogs = (item_id: string) => {
    return useQuery(getApiItemLogs(item_id));
};

export const useApiItemMedia = (item_id: string) => {
    return useQuery(itemMediaQueryOptions(item_id));
};

// Create item
// This endpoint provisions the desired item_id with a placeholder item
export const useApiCreateItem = () => {
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
export const useApiDeleteItem = (
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
export const useApiEditItem = () => {
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
