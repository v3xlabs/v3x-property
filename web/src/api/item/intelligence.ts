import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/util/query';

export const useItemSuggestion = ({ itemId }: { itemId: string }) => {
    return useMutation({
        mutationKey: ['item', '{item_id}', itemId, 'intelligence', 'suggest'],
        mutationFn: async () => {
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
                    event.data
                );
                queryClient.invalidateQueries({
                    queryKey: [
                        'item',
                        '{item_id}',
                        itemId,
                        'intelligence',
                        'suggest',
                    ],
                });
            });

            response.addEventListener('error', (event) => {
                console.log('ERROR', event);
            });

            response.addEventListener('open', (event) => {
                console.log('OPEN', event);
            });

            return response;
        },
    });
};
