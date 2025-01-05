import { useQuery } from '@tanstack/react-query';

import { apiRequest } from './core';

export type SessionResponse = {
    session_id: string;
    user_id: number;
    user_agent: string;
    user_ip: string;
    last_access: string;
    // valid: boolean;
};

export const useSessions = () =>
    useQuery<SessionResponse[]>({
        queryKey: ['sessions'],
        queryFn: async () => {
            const response = await apiRequest('/sessions', 'get', {});

            return response.data;
        },
    });
