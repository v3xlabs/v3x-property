import { queryOptions, useQuery } from '@tanstack/react-query';

import { ApiRequest, apiRequest } from './core';

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
        retry: false,
    });

export type Permission = ApiRequest<
    '/policy/enumerate',
    'get'
>['response']['data'][number];

export const useHasPolicy = (
    resourceType: string,
    resourceId: string,
    action: Permission
) => {
    const { data: policy, isSuccess } = useQuery(
        getPolicy(resourceType, resourceId)
    );

    return {
        ok: policy?.some((policyAction) => policyAction === action),
        isSuccess,
    };
};
