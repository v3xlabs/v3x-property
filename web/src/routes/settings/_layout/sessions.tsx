import { createFileRoute } from '@tanstack/react-router';

import { ActiveSessionsTable } from '@/components/user/sessions/ActiveSessionsTable';

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
