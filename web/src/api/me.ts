import { useAuth } from './auth';
import { useHttp } from './core';

export type ApiMeResponse = {
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

export function useApiMe() {
    const { token } = useAuth();

    return useHttp<ApiMeResponse>(
        '/api/me',
        {
            auth: 'required',
            skipIfUnauthed: true,
        },
        {
            enabled: !!token,
        }
    );
}
