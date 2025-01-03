import { queryOptions, useQuery } from '@tanstack/react-query';

import { apiRequest } from '../core';
import { components } from '../schema.gen';

export type SearchTasksApiResponse = components['schemas']['SearchTask'][];

export type SearchTask = components['schemas']['SearchTask'];

export type SearchTaskStatus =
    | 'enqueued'
    | 'processing'
    | 'succeeded'
    | 'failed';

export const getTasks = () =>
    queryOptions({
        queryKey: ['search', 'tasks'],
        queryFn: async () => {
            const response = await apiRequest('/search/tasks', 'get', {});

            return response.data;
        },
    });

export const useTasks = () => useQuery(getTasks());
