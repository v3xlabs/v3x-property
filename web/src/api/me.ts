import { queryOptions, useQuery } from '@tanstack/react-query';

import { useAuth } from './auth';
import { ApiRequest, apiRequest } from './core';

export type ApiMeResponse = ApiRequest<'/me', 'get'>['response']['data'];

export const getMe = () =>
    queryOptions({
        queryKey: ['me'],
        queryFn: async () => {
            const response = await apiRequest('/me', 'get', {});

            return response.data;
        },
        enabled: !!useAuth.getState().token,
    });

export const useMe = () => useQuery(getMe());
