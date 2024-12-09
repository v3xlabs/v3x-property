import { QueryClient } from '@tanstack/react-query';
// import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
// import { persistQueryClient } from '@tanstack/react-query-persist-client';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24,
        },
    },
});

// const localStoragePersister = createSyncStoragePersister({
//     storage: localStorage,
// });

// persistQueryClient({
//     // @ts-ignore
//     queryClient,
//     persister: localStoragePersister,
// });
