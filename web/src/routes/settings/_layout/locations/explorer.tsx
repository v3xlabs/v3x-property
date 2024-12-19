import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/settings/_layout/locations/explorer')({
    component: RouteComponent,
    context() {
        return {
            title: 'Locations Explorer',
        };
    },
});

function RouteComponent() {
    return <div>Hello "/settings/_layout/locations/explorer"!</div>;
}
