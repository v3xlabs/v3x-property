import { useHttp } from './core';

export const isValidId = (id?: string) => id && /^[\dA-Za-z]+$/.test(id);

export type ItemIdResponse = {
    item_id: string;
};

export const useGenerateId = () => useHttp<ItemIdResponse>('/api/item/next');
