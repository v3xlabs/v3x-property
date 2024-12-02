/* eslint-disable no-undef */
import { create } from 'zustand';

const AUTH_TOKEN_KEY = 'property.v3x.token';

export const preflightAuth = async () => {
    // If query params includes `token`, set it using setAuthToken and remove it from url

    const token = new URLSearchParams(window.location.search).get('token');

    console.log('PREFLIGHT AUTH', token);

    if (token) {
        // useAuth.getState().setAuthToken(token);
        // window.history.replaceState(
        //     {},
        //     document.title,
        //     window.location.pathname
        // );
        // window.location.reload();
        useAuth.setState({ token });
        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );
    }
};

const getTokenFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    }
};

const setTokenToLocalStorage = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
};

export const useAuth = create<{
    token: string | undefined;
    setAuthToken: (_token: string) => void;
    clearAuthToken: () => void;
}>((set) => ({
    token: getTokenFromLocalStorage() || undefined,
    setAuthToken: (token: string) => {
        setTokenToLocalStorage(token);
        set({ token: token });
    },
    clearAuthToken: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(AUTH_TOKEN_KEY);
        }

        set({ token: undefined });
    },
}));
