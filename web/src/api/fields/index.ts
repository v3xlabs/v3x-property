import { queryOptions, useQuery } from '@tanstack/react-query';

import { ApiRequest, apiRequest } from '../core';

export type FieldDefinition = ApiRequest<
    '/field/definitions',
    'get'
>['response']['data'][number];

export const getFieldDefinitions = () =>
    queryOptions({
        queryKey: ['fields', 'definitions'],
        queryFn: async () => {
            const response = await apiRequest('/field/definitions', 'get', {});

            return response.data;
        },
        retry: false,
    });

export const useFieldDefinitions = () => {
    return useQuery(getFieldDefinitions());
};
