import { queryOptions, useQuery } from '@tanstack/react-query';

import { apiRequest } from '../core';
import { components } from '../schema.gen';

export type Location = components['schemas']['Location'];

export const getLocations = () =>
    queryOptions({
        queryKey: ['locations'],
        async queryFn() {
            const response = await apiRequest('/location', 'get', {});

            return response.data;
        },
    });

export const useLocations = () => useQuery(getLocations());

export const getLocation = (location_id?: string) =>
    queryOptions({
        queryKey: ['location', location_id],
        async queryFn() {
            if (!location_id) {
                return;
            }

            const response = await apiRequest(
                '/location/{location_id}',
                'get',
                {
                    path: {
                        location_id,
                    },
                }
            );

            return response.data;
        },
        enabled: !!location_id,
    });

export const useLocation = (location_id?: string) =>
    useQuery(getLocation(location_id));
