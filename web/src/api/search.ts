import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { getHttp } from './core';

export type SearchableItem = {
    item_id: number;
    name: string;
};

export type SearchApiResponse = SearchableItem[];

export const getSearch = (
    query: string
): UseQueryOptions<SearchApiResponse> => ({
    queryKey: ['search', query],
    queryFn: getHttp<SearchApiResponse>(`/api/search?query=${query}`),
});

export const useSearch = (query: string) => useQuery(getSearch(query));
