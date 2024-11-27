import { useMutation, useQuery } from '@tanstack/react-query';

import { BASE_URL } from './core';

export type ApiItemResponse = {
    item_id: string;
    owner_id: number;
    product_id: number;
    name?: string;
    media?: number[];
    created?: string;
    modified?: string;
};

// export const useApiItemById = (id: string) =>
//     useHttp<ApiItemResponse>('/api/item/' + id);

// Mock data for now
const item: ApiItemResponse = {
    item_id: '1',
    owner_id: 1,
    product_id: 1,
    media: [1, 2, 3],
};

export const useApiItemById = (id: string) => {
    return useQuery({
        queryKey: ['item', id],
        queryFn: () => item,
    });
};

// Create item
// This endpoint provisions the desired item_id with a placeholder item
export const useApiCreateItem = () => {
    return useMutation({
        mutationFn: async (item_id: string) =>
            fetch(BASE_URL + '/api/item/create?item_id=' + item_id, {
                method: 'POST',
            }).then((response) => response.ok),
    });
};
