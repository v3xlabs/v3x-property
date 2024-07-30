/* eslint-disable no-undef */
import { create } from 'zustand';

export const preflightAuth = async () => {
    // If query params includes `token`, set it using setAuthToken and remove it from url

    const token = new URLSearchParams(window.location.search).get('token');

    console.log('PREFLIGHT AUTH', token);

    if (token) {
        useAuth.getState().setAuthToken(token);
        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );
    }
};

const getTokenFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('property.v3x.token');
    }

    return null;
};

const setTokenToLocalStorage = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('property.v3x.token', token);
    }
};

export const useAuth = create<{
    token: string | null;
    setAuthToken: (token: string) => void;
    clearAuthToken: () => void;
}>((set) => ({
    token: getTokenFromLocalStorage(),
    setAuthToken: (token: string) => {
        setTokenToLocalStorage(token);
        set({ token: token });
    },
    clearAuthToken: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('property.v3x.token');
        }

        set({ token: undefined });
    },
}));
