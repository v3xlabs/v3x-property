import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';

import { useAuth } from './auth';
import { ApiRequest, apiRequest } from './core';

export type IdCasingPreference = 'upper' | 'lower';
export type InstanceSettings = ApiRequest<
    '/instance/settings',
    'get'
>['response']['data'];

export const getInstanceSettings = queryOptions({
    queryKey: ['instance_settings'],
    queryFn: async () => {
        const response = await apiRequest('/instance/settings', 'get', {});

        return response.data;
    },
    enabled: !!useAuth.getState().token,
});

export const useInstanceSettings = () => {
    return useQuery(getInstanceSettings);
};

export type ConfigurableInstanceSettings = ApiRequest<
    '/instance/settings',
    'put'
>['body']['data'];

export const useUpdateInstanceSettings = () =>
    useMutation({
        mutationFn: async (data: ConfigurableInstanceSettings) => {
            const response = await apiRequest('/instance/settings', 'put', {
                contentType: 'application/json; charset=utf-8',
                data,
            });

            return response.data;
        },
    });

export const formatIdCasing = (
    id: string | undefined,
    id_casing_preference?: IdCasingPreference
) => {
    if (!id) return;

    if (id_casing_preference === 'upper') {
        return id.toUpperCase();
    }

    return id.toLowerCase();
};

export const formatId = (
    id: string | undefined,
    instanceSettings?: InstanceSettings
) => {
    if (!id) return;

    // Trim leading zeros
    const trimmedId = id.replace(/^0+/, '');

    return formatIdCasing(trimmedId, instanceSettings?.id_casing_preference);
};
