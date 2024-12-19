import { createFileRoute } from '@tanstack/react-router';

import { ActiveSessionsTable } from '@/components/ActiveSessionsTable';

export const Route = createFileRoute('/settings/_layout/sessions')({
    component: RouteComponent,
    context() {
        return {
            title: 'Sessions',
        };
    },
});

function RouteComponent() {
    return <ActiveSessionsTable />;
}
