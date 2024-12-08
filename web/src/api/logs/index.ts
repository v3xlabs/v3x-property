/* eslint-disable sonarjs/no-duplicate-string */
import { queryOptions, useQuery } from '@tanstack/react-query';

import { apiRequest } from '../core';

export const getAllLogs = () =>
    queryOptions({
        queryKey: ['logs'],
        queryFn: async () => {
            const response = await apiRequest('/logs', 'get', {});

            return response.data;
        },
    });

export const useAllLogs = () => {
    return useQuery(getAllLogs());
};
