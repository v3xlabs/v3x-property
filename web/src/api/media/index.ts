import { apiRequest, createQuery } from '../core';

export const useMedia = createQuery({
    queryKey: ['media'],
    fetcher: async ({ media_id }: { media_id: number }) => {
        const response = await apiRequest('/media/{media_id}', 'get', {
            path: { media_id },
        });

        return response.data;
    },
});

export const useLinkedItems = createQuery({
    queryKey: ['media', 'items'],
    fetcher: async ({ media_id }: { media_id: number }) => {
        const response = await apiRequest('/media/{media_id}/items', 'get', {
            path: { media_id },
        });

        return response.data;
    },
});
