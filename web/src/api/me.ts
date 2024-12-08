import { apiRequest, createQuery } from './core';

export type ApiMeResponse = typeof useMe.$inferData;

export const useMe = createQuery({
    queryKey: ['me'],
    fetcher: async () => {
        const response = await apiRequest('/me', 'get', {});

        return response.data;
    },
});
