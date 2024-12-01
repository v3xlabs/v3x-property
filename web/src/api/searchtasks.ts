import { useHttp } from './core';

export type SearchTasksApiResponse = SearchTask[];

export type SearchTask = {
    task_id: number;
    external_task_id: number;
    status: SearchTaskStatus;
    updated_at: string;
};

export type SearchTaskStatus =
    | 'enqueued'
    | 'processing'
    | 'succeeded'
    | 'failed';

export const useTasks = () =>
    useHttp<SearchTasksApiResponse>('/api/search/tasks', {
        auth: 'required',
    });
