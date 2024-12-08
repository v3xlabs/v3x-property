import { apiRequest, createQuery } from './core';

export type SearchTasksApiResponse = typeof useSearchTasks.$inferData;

export type SearchTask = SearchTasksApiResponse[number];

export const useSearchTasks = createQuery({
    queryKey: ['search_tasks'],
    fetcher: async () => {
        const response = await apiRequest('/search/tasks', 'get', {});

        return response.data;
    },
});
