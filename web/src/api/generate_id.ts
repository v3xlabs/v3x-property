import { apiRequest, createQuery } from './core';

export const isValidId = (id?: string) => id && /^[\dA-Za-z]+$/.test(id);

export type ItemIdResponse = typeof useGenerateId.$inferData;

export const useGenerateId = createQuery({
    queryKey: ['generate-id'],
    fetcher: async () => {
        const response = await apiRequest('/item/next', 'get', {});

        return response.data;
    },
});
