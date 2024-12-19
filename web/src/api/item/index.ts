/* eslint-disable sonarjs/no-duplicate-string */
import {
    queryOptions,
    useMutation,
    UseMutationOptions,
    useQuery,
    UseQueryOptions,
} from '@tanstack/react-query';

import { queryClient } from '@/util/query';

import { useAuth } from '../auth';
import { apiRequest, BASE_URL, getHttp } from '../core';
import { components, paths } from '../schema.gen';

export type ApiItemResponse = components['schemas']['Item'];

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

export const getOwnedItems = (token: string | undefined) =>
    queryOptions({
        queryKey: ['item', 'owned'],
        queryFn: async () => {
            const response = await apiRequest('/item/owned', 'get', {});

            return response.data;
        },
        enabled: !!token,
    });

export const useOwnedItems = () => {
    const { token } = useAuth();

    return useQuery(getOwnedItems(token));
};

export const getItemMedia = (item_id: string) =>
    queryOptions({
        queryKey: ['item', '{item_id}', item_id, 'media'],
        queryFn: async () => {
            const response = await apiRequest('/item/{item_id}/media', 'get', {
                path: { item_id },
            });

            return response.data;
        },
    });

export const useItemMedia = (item_id: string) => {
    return useQuery(getItemMedia(item_id));
};

export type ApiLogResponse =
    paths['/item/{item_id}/logs']['get']['responses']['200']['content']['application/json; charset=utf-8'];

export const getItemLogs = (
    item_id: string
): UseQueryOptions<ApiLogResponse> => ({
    queryKey: ['item', '{item_id}', item_id, 'logs'],
    queryFn: getHttp('/api/item/' + item_id + '/logs', {
        auth: 'include',
    }),
});

export const useItemLogs = (item_id: string) => {
    return useQuery(getItemLogs(item_id));
};

export const getItemTags = (item_id: string) =>
    queryOptions({
        queryKey: ['item', '{item_id}', item_id, 'tags'],
        queryFn: async () => {
            const response = await apiRequest('/item/{item_id}/tags', 'get', {
                path: { item_id },
            });

            return response.data;
        },
    });

export const useItemTags = (item_id: string) => {
    return useQuery(getItemTags(item_id));
};

export const getItemLocation = (item_id?: string) =>
    queryOptions({
        queryKey: ['item', '{item_id}', item_id, 'location'],
        queryFn: async () => {
            if (!item_id) {
                return;
            }

            const response = await apiRequest('/item/{item_id}/location', 'get', {
                path: { item_id },
            });

            return response.data;
        },
    });

export const useItemLocation = (item_id?: string) => {
    return useQuery(getItemLocation(item_id));
};

// Create item
// This endpoint provisions the desired item_id with a placeholder item
export const useCreateItem = () => {
    return useMutation({
        mutationFn: async (item_id: string) =>
            fetch(BASE_URL + 'item?item_id=' + item_id, {
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
            const response = await fetch(BASE_URL + 'item/' + item_id, {
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
export const useEditItem = (
    properties: UseMutationOptions<
        boolean,
        Error,
        {
            item_id: string;
            data: paths['/item/{item_id}']['patch']['requestBody']['content']['application/json; charset=utf-8'];
        }
    >
) => {
    return useMutation({
        ...properties,
        mutationFn: async ({
            item_id,
            data,
        }: {
            item_id: string;
            data: paths['/item/{item_id}']['patch']['requestBody']['content']['application/json; charset=utf-8'];
        }) => {
            const response = await fetch(BASE_URL + 'item/' + item_id, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + useAuth.getState().token,
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                await queryClient.invalidateQueries({
                    queryKey: ['item', '{item_id}', item_id],
                });

                if (data.media && data.media.length > 0) {
                    await queryClient.invalidateQueries({
                        queryKey: ['item', '{item_id}', item_id, 'media'],
                    });
                }

                if (data.fields && data.fields.length > 0) {
                    await queryClient.invalidateQueries({
                        queryKey: ['item', '{item_id}', item_id, 'fields'],
                    });
                }

                await queryClient.invalidateQueries({
                    queryKey: ['item', '{item_id}', item_id, 'logs'],
                });
            }

            return response.ok;
        },
    });
};

export type ItemLocation = components['schemas']['ItemLocation'];

export const useUpdateItemLocation = () => {
    return useMutation({
        mutationFn: async ({ item_id, data }: {item_id: string, data: ItemLocation}) => {
            const response = await apiRequest('/item/{item_id}/location', 'patch', {
                contentType: 'application/json; charset=utf-8',
                path: { item_id },
                data,
            });

            queryClient.invalidateQueries({
                queryKey: ['item', '{item_id}', item_id, 'location'],
            });

            return response.data;
        },
    });
};
