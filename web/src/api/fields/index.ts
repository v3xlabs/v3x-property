import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from '@/util/query';

import { ApiRequest, apiRequest } from '../core';
import { paths } from '../schema.gen';

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

export const useEditFieldDefinition = () => {
    return useMutation({
        mutationFn: async ({
            field_id,
            data,
        }: {
            field_id: string;
            data: paths['/field/definitions/{definition_id}']['patch']['requestBody']['content']['application/json; charset=utf-8'];
        }) => {
            const response = await apiRequest(
                '/field/definitions/{definition_id}',
                'patch',
                {
                    contentType: 'application/json; charset=utf-8',
                    data,
                    path: {
                        definition_id: field_id,
                    },
                }
            );

            if (response.status === 200) {
                await queryClient.invalidateQueries({
                    queryKey: ['fields', 'definitions'],
                });
            }

            return response.status === 200;
        },
    });
};

export const useCreateFieldDefinition = () => {
    return useMutation({
        mutationFn: async (
            data: paths['/field/definitions']['post']['requestBody']['content']['application/json; charset=utf-8']
        ) => {
            const response = await apiRequest('/field/definitions', 'post', {
                contentType: 'application/json; charset=utf-8',
                data,
            });

            if (response.status === 200) {
                await queryClient.invalidateQueries({
                    queryKey: ['fields', 'definitions'],
                });
            }

            return response.status === 200;
        },
    });
};
