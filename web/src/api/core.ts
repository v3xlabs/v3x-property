import { createFetch } from 'openapi-hooks';

import { useAuth } from './auth';
import { paths } from './schema.gen';
export { ApiError } from 'openapi-hooks';

export const BASE_URL =
    import.meta.env.VITE_API_URL || `${window.location.origin}/api/`;

export const apiRequest = createFetch<paths>({
    baseUrl: BASE_URL,
    get headers() {
        return {
            Authorization: `Bearer ${useAuth.getState().token}`,
        };
    },
    onError: (error) => {
        if (error.status === 401 && useAuth.getState().token) {
            console.log('Token expired, clearing token');
            useAuth.getState().clearAuthToken();
        }
    }
});
