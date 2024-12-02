import {
    useMutation,
    UseMutationOptions,
    useQuery,
    UseQueryOptions,
} from '@tanstack/react-query';

import { useAuth } from './auth';
import { BASE_URL, getHttp } from './core';

export type ApiItemResponse = {
    item_id: string;
    owner_id: number;
    product_id: number;
    name?: string;
    media?: number[];
    created?: string;
    modified?: string;
};

export const getApiItemById = (
    item_id: string
): UseQueryOptions<ApiItemResponse> => ({
    queryKey: ['item', item_id],
    queryFn: getHttp('/api/item/' + item_id, {
        auth: 'include',
    }),
});

export const useApiItemById = (item_id: string) => {
    return useQuery(getApiItemById(item_id));
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

// Create item
// This endpoint provisions the desired item_id with a placeholder item
export const useApiCreateItem = () => {
    return useMutation({
        mutationFn: async (item_id: string) =>
            fetch(BASE_URL + '/api/item/create?item_id=' + item_id, {
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
