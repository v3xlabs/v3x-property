import { queryOptions, useQuery } from '@tanstack/react-query';

import { apiRequest } from '../core';
import { components } from '../schema.gen';

export type Operator = components['schemas']['LocalOperator'];

export const getOperators = () =>
    queryOptions({
        queryKey: ['operators'],
        queryFn: async () => {
            const response = await apiRequest('/operators', 'get', {});

            return response.data;
        },
    });

export const useOperators = () => useQuery(getOperators());
