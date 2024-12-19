import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from '@/util/query';

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

export const getLocationItems = (location_id?: string) =>
    queryOptions({
        queryKey: ['location_items', location_id],
        async queryFn() {
            if (!location_id) {
                return;
            }

            const response = await apiRequest('/location/{location_id}/items', 'get', {
                path: {
                    location_id,
                }
            });

            return response.data;
        },
        enabled: !!location_id,
    });

export const useLocationItems = (location_id?: string) =>
    useQuery(getLocationItems(location_id));

export const getLocationLocations = (location_id?: string) =>
    queryOptions({
        queryKey: ['location_locations', location_id],
        async queryFn() {
            if (!location_id) {
                return;
            }

            const response = await apiRequest('/location/{location_id}/locations', 'get', {
                path: {
                    location_id,
                }
            });

            return response.data;
        },
        enabled: !!location_id,
    });

export const useLocationLocations = (location_id?: string) =>
    useQuery(getLocationLocations(location_id));

export const useCreateLocation = () => useMutation({
    mutationFn: async (location: Location) => {
        const response = await apiRequest('/location', 'post', {
            contentType: 'application/json; charset=utf-8',
            data: location,
        });

        queryClient.invalidateQueries({
            queryKey: ['locations'],
        });

        return response.data;
    },
});
