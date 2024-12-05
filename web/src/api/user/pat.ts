import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';

import { apiRequest } from '../core';

export const getUserPats = (user_id: number) =>
    queryOptions({
        queryKey: ['user_pats'],
        queryFn: async () => {
            const response = await apiRequest('/user/{user_id}/keys', 'get', {
                path: { user_id },
            });

            return response.data;
        },
    });

export const useUserPats = (user_id: number) => useQuery(getUserPats(user_id));

export const useCreateUserPat = (user_id: number) =>
    useMutation({
        mutationFn: async (data: { name: string; permissions: string }) => {
            const response = await apiRequest('/user/{user_id}/keys', 'post', {
                path: { user_id },
                contentType: 'application/json; charset=utf-8',
                data,
            });

            return response.data;
        },
    });

export const useDeleteUserPat = (user_id: number, pat_id: number) =>
    useMutation({
        mutationFn: async () => {
            const response = await apiRequest(
                '/user/{user_id}/keys/{token_id}',
                'delete',
                {
                    path: { user_id, token_id: pat_id },
                }
            );

            return response.data;
        },
    });