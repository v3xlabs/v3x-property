import { useQuery } from '@tanstack/react-query';

import { BASE_URL } from './core';

export type IdCasingPreference = 'upper' | 'lower';

export type InstanceSettings = {
    id_casing_preference: IdCasingPreference;
};

export const getInstanceSettings = () => {
    // return useHttp<InstanceSettings>('/api/instance/settings', {
    //     auth: 'include',
    // });
    return {
        queryKey: ['instance_settings'],
        queryFn: async () => {
            const response = await fetch(BASE_URL + '/api/instance/settings');

            return (await response.json()) as InstanceSettings;
        },
    };
};

export const useInstanceSettings = () => {
    return useQuery({
        queryKey: ['instance_settings'],
        queryFn: getInstanceSettings,
    });
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
