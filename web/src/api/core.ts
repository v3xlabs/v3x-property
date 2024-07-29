import useSWR from "swr";

const BASE_URL = "http://localhost:3000"

export const useHttp = <K>(url: string, token: string | null) => useSWR(token && url, async (): Promise<K | null> => {
    const headers = new Headers();

    headers.append("Authorization", "Bearer " + token);

    try {
        const response = await fetch(BASE_URL + url, { headers });
        const data = await response.json() as K;

        return data as K;
    } catch (error) {
        console.error(error);
        return null;
    }
});
