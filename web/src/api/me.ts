import { queryOptions, useQuery } from '@tanstack/react-query';

import { useAuth } from './auth';
import { ApiRequest, apiRequest } from './core';

export type ApiMeResponse = ApiRequest<'/me', 'get'>['response']['data'];

export const getMe = (authToken: string | undefined) =>
    queryOptions({
        queryKey: ['me'],
        queryFn: async () => {
            const response = await apiRequest('/me', 'get', {});

            return response.data;
        },
        enabled: !!authToken,
    });

export const useMe = () => {
    const { token } = useAuth();

    return useQuery(getMe(token));
};
