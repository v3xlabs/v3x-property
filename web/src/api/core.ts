import { QueryObserverOptions, QueryOptions, useMutation, useQuery } from '@tanstack/react-query';

import { useAuth } from './auth';

export const BASE_URL = 'http://localhost:3000';

export type HttpOptions = {
    // Whether to include the token in the request
    // - 'include' will include the token if available
    // - 'ignore' will not include the token
    // - 'required' will throw an error if the token is not available
    auth?: 'include' | 'ignore' | 'required' | 'skip';
    skipIfUnauthed?: boolean;
};

export function useHttp<T>(
    key: string,
    options?: HttpOptions,
    queryOptions?: Partial<QueryObserverOptions>
) {
    const { token, clearAuthToken } = useAuth();
    const { auth = 'ignore', skipIfUnauthed = false } = options || {};

    return useQuery({
        queryKey: [key],
        enabled: true,
        queryFn: async () => {
            const headers = new Headers();

            if (auth === 'include' || auth === 'required') {
                if (!token && auth === 'required') {
                    throw new Error(
                        'No token available but endpoint requires it, key: ' +
                            key
                    );
                }

                headers.append('Authorization', 'Bearer ' + token);
            }

            try {
                const response = await fetch(BASE_URL + key, { headers });

                if (response.status === 401) {
                    console.log('Token expired, clearing token');
                    clearAuthToken();

                    throw new Error('Token expired');
                }

                return (await response.json()) as T;
            } catch (error) {
                console.error(error);
                throw error;
            }
        },
        ...queryOptions,
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
