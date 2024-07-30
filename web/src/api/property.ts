import { useHttp } from './core';

export type PropertyResponse = {
    id: number;
    owner_id: number;
    product_id: number;
    name?: string;
    media?: number[];
    created?: string;
    modified?: string;
};

export const useProperty = (id: string) =>
    useHttp<PropertyResponse>('/api/property/' + id);
