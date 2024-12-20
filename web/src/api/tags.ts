/* eslint-disable sonarjs/no-duplicate-string */
import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from '@/util/query';

import { apiRequest } from './core';
import { components } from './schema.gen';

export type Tag = components['schemas']['Tag'];

export const getTags = () => queryOptions({
    queryKey: ['tags', 'list'],
    queryFn: async () => {
        const response = await apiRequest('/tags', 'get', {});

        return response.data;
    }
});

export const useTags = () => useQuery(getTags());

export const getTagById = (tagId?: number) => queryOptions({
    queryKey: ['tags', '{tag_id}', tagId],
    queryFn: async () => {
        if (!tagId) return;

        const response = await apiRequest('/tags/{tag_id}', 'get', {
            path: {
                tag_id: tagId,
            },
        });

        return response.data;
    },
    enabled: !!tagId,
});

export const useTagById = (tagId?: number) => useQuery(getTagById(tagId));


export const useTagCreate = () => useMutation({
    mutationFn: async (tag: Tag) => {
        const response = await apiRequest('/tags', 'post', {
            contentType: 'application/json; charset=utf-8',
            data: {
                name: tag.name,
                tag_id: tag.tag_id,
            },
        });

        queryClient.invalidateQueries({ queryKey: ['tags'] });

        return response.data;
    }
});

export const useTagDelete = () => useMutation({
    mutationFn: async (tagId: number) => {
        const response = await apiRequest('/tags/{tag_id}', 'delete', {
            path: {
                tag_id: tagId,
            },
        });

        return response.data;
    }
});

export const useTagEdit = () => useMutation({
    mutationFn: async (tag: Tag) => {
        const response = await apiRequest('/tags/{tag_id}', 'put', {
            path: {
                tag_id: tag.tag_id,
            },
            contentType: 'application/json; charset=utf-8',
            data: {
                tag_id: tag.tag_id,
                name: tag.name,
                color: tag.color,
            },
        });

        queryClient.invalidateQueries({ queryKey: ['tags', '{tag_id}', tag.tag_id] });
        queryClient.invalidateQueries({ queryKey: ['tags', 'list'] });

        return response.data;
    }
});
