import { apiRequest, createQuery } from './core';

export type InstanceSettings = typeof useInstanceSettings.$inferData;

export type IdCasingPreference = InstanceSettings['id_casing_preference'];

export const useInstanceSettings = createQuery({
    queryKey: ['instance_settings'],
    fetcher: async () => {
        const response = await apiRequest('/instance/settings', 'get', {});

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
