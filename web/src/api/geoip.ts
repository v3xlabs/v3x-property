import { useQuery, UseQueryOptions } from '@tanstack/react-query';

type GeoIpResponse = {
    ip_address: string;
    latitude: number;
    longitude: number;
    postal_code: string;
    continent_code: string;
    continent_name: string;
    country_code: string;
    country_name: string;
    region_code: string;
    region_name: string;
    province_code: string;
    province_name: string;
    city_name: string;
    timezone: string;
};

export const getGeoIp = (ip: string): UseQueryOptions<GeoIpResponse> => ({
    queryKey: ['geoip', ip],
    queryFn: async () => {
        const response = await fetch(`https://api.geoip.rs/?ip=${ip}`);

        return (await response.json()) as GeoIpResponse;
    },
});

export function useGeoIp(ip: string) {
    return useQuery(getGeoIp(ip));
}
