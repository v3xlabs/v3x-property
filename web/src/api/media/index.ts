import { queryOptions, useQuery } from '@tanstack/react-query';

import { ApiRequest, apiRequest } from '../core';

export type MediaResponse = ApiRequest<
    '/media/{media_id}',
    'get'
>['response']['data'];

export const getMedia = (media_id: number | undefined) =>
    queryOptions({
        queryKey: ['media', media_id],
        queryFn: async () => {
            if (!media_id) return;

            const response = await apiRequest('/media/{media_id}', 'get', {
                path: { media_id },
            });

            return response.data;
        },
        enabled: !!media_id,
    });

export const useMedia = (media_id: number | undefined) =>
    useQuery(getMedia(media_id));

export type LinkedItem = ApiRequest<
    '/media/{media_id}/items',
    'get'
>['response']['data'];

export const getLinkedItems = (media_id: number | undefined) =>
    queryOptions({
        queryKey: ['media', media_id, 'items'],
        queryFn: async () => {
            if (!media_id) return;

            const response = await apiRequest(
                '/media/{media_id}/items',
                'get',
                {
                    path: { media_id },
                }
            );

            return response.data;
        },
        enabled: !!media_id,
    });

export const useLinkedItems = (media_id: number | undefined) =>
    useQuery(getLinkedItems(media_id));

export const getAllMedia = () => {
    return queryOptions({
        queryKey: ['media'],
        queryFn: async () => {
            const response = await apiRequest('/media', 'get', {});

            return response.data;
        },
    });
};

export const useAllMedia = () => useQuery(getAllMedia());

export const getUnassignedMedia = () => {
    return queryOptions({
        queryKey: ['media', 'unassigned'],
        queryFn: async () => {
            const response = await apiRequest('/media/unassigned', 'get', {});

            return response.data;
        },
    });
};

export const useUnassignedMedia = () => useQuery(getUnassignedMedia());
