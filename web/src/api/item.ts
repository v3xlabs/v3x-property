import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

import { BASE_URL, getHttp } from './core';
import { useAuth } from './auth';

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
