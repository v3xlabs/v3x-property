import { queryOptions } from '@tanstack/react-query';

import { apiRequest } from './core';

export const getPolicy = (resourceType: string, resourceId: string) =>
    queryOptions({
        queryKey: ['policy', resourceType, resourceId],
        queryFn: async () => {
            const response = await apiRequest('/policy/enumerate', 'get', {
                query: {
                    resource_type: resourceType,
                    resource_id: resourceId,
                },
            });

            return response.data;
        },
    });
