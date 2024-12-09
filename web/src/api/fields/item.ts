import { queryOptions, useQuery } from '@tanstack/react-query';

import { ApiRequest, apiRequest } from '../core';

export type ItemField = ApiRequest<
    '/item/{item_id}/fields',
    'get'
>['response']['data'][number];

export const getItemFields = (itemId: string) =>
    queryOptions({
        queryKey: ['fields', 'item', itemId],
        queryFn: async () => {
            const response = await apiRequest('/item/{item_id}/fields', 'get', {
                path: {
                    item_id: itemId,
                },
            });

            return response.data;
        },
        retry: false,
    });

export const useItemFields = (itemId: string) => {
    return useQuery(getItemFields(itemId));
};
