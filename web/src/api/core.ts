import { useMutation, useQuery } from '@tanstack/react-query';

import { useAuth } from './auth';

export const BASE_URL = 'http://localhost:3000';

export function useHttp<T>(key: string) {
    const { token, clearAuthToken } = useAuth();

    return useQuery({
        queryKey: [key],
        queryFn: async () => {
            const headers = new Headers();

            headers.append('Authorization', 'Bearer ' + token);

            try {
                const response = await fetch(BASE_URL + key, { headers });

                if (response.status === 401) {
                    console.log('Token expired, clearing token');
                    clearAuthToken();

                    return;
                }

                return (await response.json()) as T;
            } catch (error) {
                console.error(error);
            }
        },
    });
}

// For mutations (if you have any POST/PUT/DELETE operations)
export function useUpdateData<T>(url: string) {
    const { token } = useAuth();

    return useMutation({
        mutationFn: (data: T) =>
            fetch(BASE_URL + url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            }).then((response) => response.json()),
    });
}
