import { apiRequest, createQuery } from './core';

export type SessionResponse = (typeof useSessions.$inferData)[number];

export const useSessions = createQuery({
    queryKey: ['sessions'],
    fetcher: async () => {
        const response = await apiRequest('/sessions', 'get', {});

        return response.data;
    },
});
