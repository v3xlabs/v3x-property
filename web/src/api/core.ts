import useSWR from "swr";

export const useHttp = <K>(url: string, token: string | null) => useSWR(token && url, async (): Promise<K | null> => {
    const headers = new Headers();

    headers.append("Authorization", "Bearer " + token);

    try {
        const response = await fetch("http://localhost:3000/api/properties", { headers });
        const data = await response.json() as K;

        return data as K;
    } catch (error) {
        console.error(error);
        return null;
    }
});
