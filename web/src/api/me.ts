import { useQuery } from '@tanstack/react-query';

import { useAuth } from './auth';
import { fetcher } from './core';

interface MeResponse {
    id: string;
    name: string;
    picture?: string;
    // Add other fields as needed
}

export function useApiMe() {
    const { token } = useAuth();

    return useQuery({
        queryKey: ['me', token],
        queryFn: () =>
            fetcher<MeResponse>('/api/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
        enabled: !!token, // Only run query if token exists
    });
}
