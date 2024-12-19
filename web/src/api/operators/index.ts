import { queryOptions, useQuery } from '@tanstack/react-query';

import { apiRequest } from '../core';

export const getOperators = () =>
    queryOptions({
        queryKey: ['operators'],
        queryFn: async () => {
            const response = await apiRequest('/operators', 'get', {});

            return response.data;
        },
    });

export const useOperators = () => useQuery(getOperators());
