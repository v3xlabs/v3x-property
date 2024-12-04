import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { getHttp } from './core';

type MediaResponse = {
    media_id: number;
    description: string;
    url: string;
};

export const getMedia = (
    media_id: number | undefined
): UseQueryOptions<MediaResponse> => {
    return {
        queryKey: ['media', media_id],
        queryFn: getHttp<MediaResponse>(`/api/media/${media_id}`, {
            auth: 'include',
        }),
        enabled: !!media_id,
    };
};

export const useMedia = (media_id: number | undefined) =>
    useQuery(getMedia(media_id));

export type LinkedItem = {
    item_id: string;
    name: string;
    media_id: number;
};

export const getLinkedItems = (
    media_id: number | undefined
): UseQueryOptions<LinkedItem[]> => ({
    queryKey: ['media', media_id, 'items'],
    queryFn: getHttp<LinkedItem[]>(`/api/media/${media_id}/items`, {
        auth: 'include',
    }),
    enabled: !!media_id,
});

export const useLinkedItems = (media_id: number | undefined) =>
    useQuery(getLinkedItems(media_id));
