import { useQuery } from '@tanstack/react-query';

import { BASE_URL, fetcher } from './core';

interface GeoIPResponse {
    ip: string;
    country: string;
    city?: string;
    // Add other fields based on your API response
}

export function useGeoIp() {
    return useQuery({
        queryKey: ['geoip'],
        queryFn: () => fetcher<GeoIPResponse>(`${BASE_URL}/api/geoip`),
        // Add any specific options you need:
        // staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        // cacheTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
    });
}
