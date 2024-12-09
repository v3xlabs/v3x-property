import { queryOptions, useQuery } from '@tanstack/react-query';

import { useAuth } from '../auth';
import { ApiRequest, apiRequest } from '../core';

export const isValidId = (id?: string) => id && /^[\dA-Za-z]+$/.test(id);

export type ItemIdResponse = ApiRequest<
    '/item/next',
    'get'
>['response']['data'];

export const getNextItemId = () =>
    queryOptions({
        queryKey: ['item', 'next'],
        queryFn: async () => {
            const response = await apiRequest('/item/next', 'get', {});

            return response.data;
        },
        enabled: !!useAuth.getState().token,
    });

export const useGenerateId = () => useQuery(getNextItemId());
