import { ApiRoute, useHttp } from '../core';

export const isValidId = (id?: string) => id && /^[\dA-Za-z]+$/.test(id);

export type ItemIdResponse = ApiRoute<'/item/next', 'get'>['response']['data'];

// TODO: migrate away from useHttp (to mutation)
export const useGenerateId = () => useHttp<ItemIdResponse>('/api/item/next');
