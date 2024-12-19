import { createFileRoute } from '@tanstack/react-router';

import { BuildDetails } from '@/components/settings/BuildDetails';

export const Route = createFileRoute('/settings/_layout/build')({
    component: RouteComponent,
    context() {
        return {
            title: 'Software Info',
        };
    },
});

function RouteComponent() {
    return <BuildDetails />;
}
