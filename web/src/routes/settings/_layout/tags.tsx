import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/settings/_layout/tags')({
    component: RouteComponent,
    context(context) {
        return {
            title: 'Tags',
        };
    },
});

function RouteComponent() {
    return <div className="card">Hello "/settings/tags"!</div>;
}
