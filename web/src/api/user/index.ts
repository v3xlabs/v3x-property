import { queryOptions, useQuery } from '@tanstack/react-query';

import { ApiRequest, apiRequest } from '../core';

export type ApiUserByIdResponse = ApiRequest<
    '/user/{user_id}',
    'get'
>['response'];

export const getUserById = (user_id: number) =>
    queryOptions({
        queryKey: ['user', user_id],
        queryFn: async () => {
            const response = await apiRequest('/user/{user_id}', 'get', {
                path: { user_id },
            });

            return response.data;
        },
    });

export const useUserById = (user_id: number) => useQuery(getUserById(user_id));

export const getUsers = () =>
    queryOptions({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await apiRequest('/user', 'get', {});

            return response.data;
        },
    });

export const useUsers = () => useQuery(getUsers());

export const getUserInventory = (user_id?: number) =>
    queryOptions({
        queryKey: ['user', user_id, 'inventory'],
        queryFn: async () => {
            if (!user_id) {
                return;
            }

            const response = await apiRequest('/user/{user_id}/items', 'get', {
                path: { user_id },
            });

            return response.data;
        },
    });

export const useUserInventory = (user_id?: number) => useQuery(getUserInventory(user_id));