import { apiRequest, createQuery } from '../core';

export const useUserById = createQuery({
    queryKey: ['user', 'by-id'],
    fetcher: async ({ user_id }: { user_id: number }) => {
        const response = await apiRequest('/user/{user_id}', 'get', {
            path: { user_id },
        });

        return response.data;
    },
});
