import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/tag/$tagId')({
    component: RouteComponent,
});

function RouteComponent() {
    return <div>Hello "/tag/$tagId"!</div>;
}
