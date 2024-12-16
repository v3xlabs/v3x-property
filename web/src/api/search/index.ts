import { queryOptions, useQuery } from '@tanstack/react-query';

import { ApiRequest, apiRequest } from '../core';
import { useAuth } from '../auth';

export type SearchableItem = ApiRequest<
    '/search',
    'get'
>['response']['data'][number];

export type SearchApiResponse = SearchableItem[];

export const getSearch = (query: string, token: string | undefined) =>
    queryOptions({
        queryKey: ['search', query],
        queryFn: async () => {
            const response = await apiRequest('/search', 'get', {
                query: {
                    query,
                },
            });

            return response.data;
        },
        enabled: !!token,
    });

export const useSearch = (query: string) => {
    const { token } = useAuth();

    return useQuery(getSearch(query, token));
};
