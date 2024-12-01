import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { getHttp } from './core';

export type IdCasingPreference = 'upper' | 'lower';

export type InstanceSettings = {
    id_casing_preference: IdCasingPreference;
};

export const getInstanceSettings = (): UseQueryOptions<InstanceSettings> => {
    return {
        queryKey: ['instance_settings'],
        queryFn: getHttp('/api/instance/settings', {
            auth: 'include',
        }),
    };
};

export const useInstanceSettings = () => {
    return useQuery(getInstanceSettings());
};

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
