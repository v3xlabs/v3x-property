import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from '@/util/query';

import { useAuth } from '../auth';
import { ApiRequest, apiRequest } from '../core';

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

export const useSearchIndexAllItems = () => useMutation({
    mutationFn: async () => {
        const response = await apiRequest('/search/reindex', 'post', {});

        // queryClient.invalidateQueries({ queryKey: ['search', 'tasks'] });
        queryClient.invalidateQueries({ queryKey: ['search'] });

        return response.data;
    },
});

export const useSearchClearIndex = () => useMutation({
    mutationFn: async () => {
        const response = await apiRequest('/search/clear', 'post', {});

        queryClient.invalidateQueries({ queryKey: ['search'] });

        return response.data;
    },
});
