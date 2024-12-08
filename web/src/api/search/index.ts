import { apiRequest, createQuery } from '../core';

export type SearchableItem = (typeof useSearch.$inferData)[number];

export const useSearch = createQuery({
    queryKey: ['search'],
    fetcher: async ({ query }: { query: string }) => {
        const response = await apiRequest('/search', 'get', {
            query: {
                query,
            },
        });

        return response.data;
    },
});
