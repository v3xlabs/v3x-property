import { useQuery } from '@tanstack/react-query';

type MediaResponse = {
    media_id: number;
    description: string;
    url: string;
};

export const useMedia = (media_id: number | undefined) =>
    // useHttp<MediaResponse>('/api/media/' + id);
    {
        return useQuery({
            queryKey: ['media', media_id],
            queryFn: () => {
                if (!media_id) {
                    return;
                }

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
                }[media_id];
            },
        });
    };
