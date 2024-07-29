import useSWR from "swr";
import { useAuth } from "./auth";

const BASE_URL = "http://localhost:3000"

export const useHttp = <K>(url: string) => {
    const { token, clearAuthToken } = useAuth();

    return useSWR(token && url, async (): Promise<K | null> => {
        const headers = new Headers();

        headers.append("Authorization", "Bearer " + token);

        try {
            const response = await fetch(BASE_URL + url, { headers });

            if (response.status === 401) {
                console.log("Token expired, clearing token");
                clearAuthToken();
                return null;
            }

            const data = await response.json() as K;

            return data as K;
        } catch (error) {
            console.error(error);
            return null;
        }
    });
};
