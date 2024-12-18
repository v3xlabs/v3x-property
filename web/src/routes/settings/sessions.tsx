import { createFileRoute } from '@tanstack/react-router';

import { ActiveSessionsTable } from '@/components/ActiveSessionsTable';
import { SettingsNav } from '@/components/settings/nav';
import { SidePage } from '@/layouts/SidebarPage';

export const Route = createFileRoute('/settings/sessions')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <SidePage title="Sessions" sidebar={<SettingsNav />}>
            <ActiveSessionsTable />
        </SidePage>
    );
}
