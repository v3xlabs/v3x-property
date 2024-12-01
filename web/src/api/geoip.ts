import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { getHttp } from './core';

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
    queryFn: getHttp('/api/geoip', {
        auth: 'include',
    }),
});

export function useGeoIp(ip: string) {
    return useQuery(getGeoIp(ip));
}
