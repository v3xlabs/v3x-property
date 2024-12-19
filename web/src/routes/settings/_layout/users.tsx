import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/settings/_layout/users')({
    component: RouteComponent,
    context() {
        return {
            title: 'Users',
        };
    },
});

function RouteComponent() {
    return <div>Hello "/settings/users"!</div>;
}
