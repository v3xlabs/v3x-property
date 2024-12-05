import { queryOptions, useQuery } from '@tanstack/react-query';

import { ApiRequest, apiRequest } from '../core';

export type SearchableItem = ApiRequest<
    '/search',
    'get'
>['response']['data'][number];

export type SearchApiResponse = SearchableItem[];

export const getSearch = (query: string) =>
    queryOptions({
        queryKey: ['search', query],
        queryFn: async () => {
            const response = await apiRequest('/search', 'get', {
                // TODO: implement query into search
                // query,
            });

            return response.data;
        },
    });

export const useSearch = (query: string) => useQuery(getSearch(query));
