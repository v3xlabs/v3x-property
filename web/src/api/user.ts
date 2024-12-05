import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';

import { apiRequest, useHttp } from './core';

export type ApiUserByIdResponse = {
    user_id: number;
    oauth_sub: string;
    name: string;
    picture: string;
    // oauth_data: {
    //     sub: string;
    //     name: string;
    //     given_name: string;
    //     family_name: string;
    //     middle_name: null;
    //     nickname: null;
    //     preferred_username: null;
    //     profile: null;
    //     picture: string;
    //     website: null;
    //     email: string;
    //     email_verified: boolean;
    //     gender: null;
    //     birthdate: null;
    //     zoneinfo: null;
    //     locale: null;
    //     phone_number: null;
    //     phone_number_verified: boolean;
    //     address: null;
    //     updated_at: null;
    // };
};

export const useApiUserById = (user_id: string) =>
    useHttp<ApiUserByIdResponse>(`/api/user/${user_id}`);

export const getUserApiKeys = (user_id: number) =>
    queryOptions({
        queryKey: ['user_api_keys'],
        queryFn: async () => {
            const response = await apiRequest('/user/{user_id}/keys', 'get', {
                path: { user_id },
            });

            return response.data;
        },
    });

export const useUserApiKeys = (user_id: number) =>
    useQuery(getUserApiKeys(user_id));

export const createUserApiKey = (user_id: number) =>
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

export const deleteUserApiKey = (user_id: number, token_id: number) =>
    useMutation({
        mutationFn: async () => {
            const response = await apiRequest(
                '/user/{user_id}/keys/{token_id}',
                'delete',
                {
                    path: { user_id, token_id },
                }
            );

            return response.data;
        },
    });
