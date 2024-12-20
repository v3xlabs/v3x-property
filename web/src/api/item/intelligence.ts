import { useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from '@/util/query';

type SuggestionResponseEventPayload = {
    status: 'idle' | 'loading' | 'success';
    contents: string[];
};

export const useItemSuggestion = ({ itemId }: { itemId: string }) => {
    const { data } = useQuery<SuggestionResponseEventPayload>({
        queryKey: ['item', '{item_id}', itemId, 'intelligence', 'suggest'],
    });

    console.log('DATA', data);

    const mutation = useMutation({
        mutationFn: async () => {
            console.log('MUTATION');
            queryClient.setQueryData(
                ['item', '{item_id}', itemId, 'intelligence', 'suggest'],
                {
                    status: 'loading',
                    contents: [],
                }
            );

            // TODO: Maybe update someday
            // Open a request using apiRequest to /api/item/:item_id/intelligence/suggest
            // const response = await apiRequest(
            //     '/item/{item_id}/intelligence/suggest',
            //     'get',
            //     {
            //         path: { item_id: itemId },
            //     }
            // );

            const response = new EventSource(
                `/api/item/${itemId}/intelligence/suggest`,
                {
                    withCredentials: true,
                }
            );

            response.addEventListener('message', (event) => {
                console.log('EVENT', event.data);
                queryClient.setQueryData(
                    ['item', '{item_id}', itemId, 'intelligence', 'suggest'],
                    (oldData: SuggestionResponseEventPayload) =>
                        ({
                            ...oldData,
                            status: 'loading',
                            contents: [...oldData.contents, event.data],
                        } as SuggestionResponseEventPayload)
                );
            });

            response.addEventListener('error', (event) => {
                console.log('ERROR', event);
                response.close();
                queryClient.setQueryData(
                    ['item', '{item_id}', itemId, 'intelligence', 'suggest'],
                    (oldData: SuggestionResponseEventPayload) =>
                        ({
                            ...oldData,
                            status: 'success',
                            contents: [...oldData.contents],
                        } as unknown as SuggestionResponseEventPayload)
                );
            });

            response.addEventListener('open', (event) => {
                console.log('OPEN', event);
            });

            return response;
        },
        retry: false,
        onError: (error) => {
            console.log('ERRORz', error);
        },
    });

    return { ...mutation, data };
};
