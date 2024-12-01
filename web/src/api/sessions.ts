import { useHttp } from './core';

export type SessionResponse = {
    session_id: string;
    user_id: number;
    user_agent: string;
    user_ip: string;
    last_access: string;
    // valid: boolean;
};

export const useSessions = () =>
    useHttp<SessionResponse[]>('/api/sessions', {
        auth: 'required',
    });
