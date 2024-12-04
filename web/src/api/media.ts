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
