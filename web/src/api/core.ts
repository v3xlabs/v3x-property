import {
    DefinedUseQueryResult,
    QueryObserverOptions,
    useQuery,
} from '@tanstack/react-query';

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

export const getHttp =
    <T>(url: string, options?: HttpOptions) =>
    async () => {
        const { token, clearAuthToken } = useAuth.getState();
        const { auth = 'ignore' } = options || {};

        const headers = new Headers();

        if (auth === 'include' || auth === 'required') {
            if (!token && auth === 'required') {
                throw new Error(
                    'No token available but endpoint requires it, url: ' + url
                );
            }

            headers.append('Authorization', 'Bearer ' + token);
        }

        try {
            const response = await fetch(BASE_URL + url, { headers });

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
    };

export function useHttp<T>(
    key: string,
    options?: HttpOptions,
    queryOptions?: Partial<QueryObserverOptions>
): DefinedUseQueryResult<T, Error> {
    const { token } = useAuth();
    const { auth = 'ignore', skipIfUnauthed = false } = options || {};

    return useQuery({
        queryKey: [key],
        enabled: auth !== 'required' || !!token,
        queryFn: getHttp(key, options),
        ...queryOptions,
    }) as DefinedUseQueryResult<T, Error>;
}
