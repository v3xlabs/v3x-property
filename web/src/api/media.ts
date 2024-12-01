import { useQuery } from '@tanstack/react-query';

type MediaResponse = {
    media_id: number;
    description: string;
    url: string;
};

export const useMedia = (id: number) =>
    // useHttp<MediaResponse>('/api/media/' + id);
    {
        return useQuery({
            queryKey: ['media', id],
            queryFn: () => {
                return {
                    1: {
                        id: 1,
                        description: 'test',
                        url: '/test.webp',
                    },
                    2: {
                        id: 2,
                        description: 'test2',
                        url: '/test.stl',
                    },
                    3: {
                        id: 3,
                        description: 'test3',
                        url: '/test2.stl',
                    },
                }[id];
            },
        });
    };
