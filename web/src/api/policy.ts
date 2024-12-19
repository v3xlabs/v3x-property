import { queryOptions, useQuery } from '@tanstack/react-query';
import { create } from '@yornaath/batshit';

import { ApiRequest, apiRequest } from './core';

const batcher = create({
    fetcher: async (queries: { resourceType: string, resourceId?: string }[]) => {
        const response = await apiRequest('/policy/batch', 'post', {
            contentType: 'application/json; charset=utf-8',
            data: queries.map(({ resourceId, resourceType }) => ({
                resource_type: resourceType,
                resource_id: resourceId,
            })),
        });

        return response.data;
    },
    resolver: (item, query) => {
        return item
            .find(({ resource_id, resource_type }) => resource_id === query.resourceId && resource_type === query.resourceType)
            ?.result;
    }
});

export const getPolicy = (resourceType: string, resourceId?: string) =>
    queryOptions({
        queryKey: ['policy', resourceType, resourceId],
        queryFn: async () => batcher.fetch({
            resourceType,
            resourceId,
        }),
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
