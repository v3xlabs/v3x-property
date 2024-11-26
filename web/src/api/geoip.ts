import { useQuery } from '@tanstack/react-query';

const BASE_URL = 'http://localhost:3000';

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

export function useGeoIp(ip: string) {
    return useQuery({
        queryKey: ['geoip'],
        queryFn: async () => {
            const response = await fetch('https://api.geoip.rs/?ip=' + ip);
            const data = await response.json();

            return data as GeoIpResponse;
        },
    });
}
