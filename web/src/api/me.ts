import { queryOptions, useQuery } from '@tanstack/react-query';

import { ApiRequest, apiRequest } from './core';

export type ApiMeResponse = ApiRequest<'/me', 'get'>['response']['data'];

export const getMe = () =>
    queryOptions({
        queryKey: ['me'],
        queryFn: async () => {
            const response = await apiRequest('/me', 'get', {});

            return response.data;
        },
    });

export const useMe = () => useQuery(getMe());
