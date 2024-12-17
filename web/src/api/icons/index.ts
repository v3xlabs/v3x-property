import { queryOptions, useQuery } from '@tanstack/react-query';

const FA_ICONS_URL =
    'https://raw.githubusercontent.com/v3xlabs/icons/refs/heads/master/data/fa.json';

const FEATHER_ICONS_URL =
    'https://raw.githubusercontent.com/v3xlabs/icons/refs/heads/master/data/feather.json';

export type FaIcons = {
    svgs: {
        [key: string]: {
            url: string;
            icons: string[];
        };
    };
};

export type FeatherIcons = {
    svgs: {
        url: string;
        icons: string[];
    };
};

export const getFaIcons = ({ enabled }: { enabled?: boolean } = {}) =>
    queryOptions({
        queryKey: ['fa-icons'],
        queryFn: () => {
            return fetch(FA_ICONS_URL, { cache: 'force-cache' }).then(
                (response) => response.json() as Promise<FaIcons>
            );
        },
        enabled,
    });

export const useFaIcons = ({ enabled }: { enabled?: boolean } = {}) => {
    return useQuery(getFaIcons({ enabled }));
};

export const getFeatherIcons = ({ enabled }: { enabled?: boolean } = {}) =>
    queryOptions({
        queryKey: ['feather-icons'],
        queryFn: () => {
            return fetch(FEATHER_ICONS_URL, { cache: 'force-cache' }).then(
                (response) => response.json() as Promise<FeatherIcons>
            );
        },
        enabled,
    });

export const useFeatherIcons = ({ enabled }: { enabled?: boolean } = {}) => {
    return useQuery(getFeatherIcons({ enabled }));
};
