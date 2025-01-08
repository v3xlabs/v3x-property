import { queryOptions, useQuery } from '@tanstack/react-query';

import { useAuth } from './auth';
import { apiRequest } from './core';
import { components } from './schema.gen';

export type ApiMeResponse = components['schemas']['User'];

export const getMe = (authToken: string | undefined) =>
    queryOptions({
        queryKey: ['me'],
        queryFn: async () => {
            const response = await apiRequest('/me', 'get', {});

            return response.data;
        },
        enabled: !!authToken,
        gcTime: 0,
    });

export const useMe = () => {
    const { token } = useAuth();

    return useQuery(getMe(token));
};
