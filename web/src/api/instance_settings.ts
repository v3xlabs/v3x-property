import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';

import { useAuth } from './auth';
import { apiRequest } from './core';
import { components } from './schema.gen';

export type IdCasingPreference = 'upper' | 'lower';
export type InstanceSettings = components['schemas']['InstanceSettings'];

export const getInstanceSettings = () =>
    queryOptions({
        queryKey: ['instance', 'settings'],
        queryFn: async () => {
            const response = await apiRequest('/instance/settings', 'get', {});

            return response.data;
        },
        enabled: !!useAuth.getState().token,
    });

export const useInstanceSettings = () => {
    return useQuery(getInstanceSettings());
};

export type ConfigurableInstanceSettings = components['schemas']['InstanceSettingsConfigurable'];

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

export const getPublicInstanceSettings = () =>
    queryOptions({
        queryKey: ['instance', 'public'],
        queryFn: async () => {
            const response = await apiRequest('/instance/public', 'get', {});

            return response.data;
        },
    });

export const usePublicInstanceSettings = () => {
    return useQuery(getPublicInstanceSettings());
};

export const useInstanceStatistics = () => {
    return useQuery({
        queryKey: ['instance_statistics'],
        queryFn: async () => {
            const response = await apiRequest(
                '/instance/statistics',
                'get',
                {}
            );

            return response.data;
        },
    });
};

export const useInstanceStorageStatistics = () => {
    return useQuery({
        queryKey: ['instance_storage_statistics'],
        queryFn: async () => {
            const response = await apiRequest(
                '/instance/statistics/storage',
                'get',
                {}
            );

            return response.data;
        },
    });
};

export const useInstanceVersion = () => {
    return useQuery({
        queryKey: ['instance_version'],
        queryFn: async () => {
            const response = await apiRequest('/instance/version', 'get', {});

            return response.data;
        },
    });
};
