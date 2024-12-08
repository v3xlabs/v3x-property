import { apiRequest, createMutation, createQuery } from '../core';

export const useUserPats = createQuery({
    queryKey: ['user', 'pats'],
    fetcher: async ({ user_id }: { user_id: number }) => {
        const response = await apiRequest('/user/{user_id}/keys', 'get', {
            path: { user_id },
        });

        return response.data;
    },
});

export const useCreateUserPat = createMutation({
    mutationKey: ['user', 'pat', 'create'],
    mutationFn: async ({
        user_id,
        ...data
    }: {
        user_id: number;
        name: string;
        permissions: string;
    }) => {
        const response = await apiRequest('/user/{user_id}/keys', 'post', {
            path: { user_id },
            contentType: 'application/json; charset=utf-8',
            data,
        });

        return response.data;
    },
});

export const useDeleteUserPat = createMutation({
    mutationKey: ['user', 'pat', 'delete'],
    mutationFn: async ({
        user_id,
        pat_id,
    }: {
        user_id: number;
        pat_id: number;
    }) => {
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
