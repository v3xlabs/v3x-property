import {
    DefinedUseQueryResult,
    QueryObserverOptions,
    useQuery,
} from '@tanstack/react-query';

import { useAuth } from './auth';
import { paths } from './schema.gen';

export const BASE_URL = 'http://localhost:3000';

type Request<
    TPath extends keyof paths,
    TMethod extends keyof paths[TPath]
> = paths[TPath][TMethod] extends {
    responses: Record<
        number,
        {
            content: Record<string, any>;
        }
    >;
}
    ? paths[TPath][TMethod]
    : never;

export type ResponseType<
    TPath extends keyof paths,
    TMethod extends keyof paths[TPath] = 'get',
    TStatus extends keyof Request<TPath, TMethod>['responses'] = 200
> = Request<TPath, TMethod>['responses'][TStatus] extends {
    content: Record<string, infer R>;
}
    ? R
    : never;

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

            if (!response.ok) {
                throw new Error(response.statusText);
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
