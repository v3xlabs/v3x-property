import { useHttp } from './core';

type MediaResponse = {
    id: number;
    description: string;
    url: string;
};

export const useMedia = (id: string) =>
    useHttp<MediaResponse>('/api/media/' + id);
