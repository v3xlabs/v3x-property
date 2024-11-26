import { useMutation, useQuery } from '@tanstack/react-query';

export const BASE_URL = 'http://localhost:3000';

// Replace SWR fetcher with axios or fetch implementation
// eslint-disable-next-line no-undef
export async function fetcher<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, init);

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return response.json();
}

// Replace useSWR hooks with useQuery
export function useHttp<T>(key: string) {
    return useQuery({
        queryKey: [key],
        queryFn: () => fetcher<T>(key),
    });
}

// For mutations (if you have any POST/PUT/DELETE operations)
export function useUpdateData<T>(url: string) {
    return useMutation({
        mutationFn: (data: T) =>
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            }).then((response) => response.json()),
    });
}
