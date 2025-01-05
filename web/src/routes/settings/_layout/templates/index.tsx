import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/settings/_layout/templates/')({
    component: RouteComponent,
    context() {
        return {
            title: 'Templates',
        };
    },
});

function RouteComponent() {
    return <div className="card">Templates go here</div>;
}
