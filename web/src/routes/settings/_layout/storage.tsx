import { createFileRoute } from '@tanstack/react-router';

import { StorageDetails } from '@/components/settings/StorageDetails';

export const Route = createFileRoute('/settings/_layout/storage')({
    component: RouteComponent,
    context() {
        return {
            title: 'Storage',
        };
    },
});

function RouteComponent() {
    return <StorageDetails />;
}
