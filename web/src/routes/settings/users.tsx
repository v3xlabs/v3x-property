import { createFileRoute } from '@tanstack/react-router';

import { SettingsNav } from '@/components/settings/nav';
import { SidePage } from '@/layouts/SidebarPage';

export const Route = createFileRoute('/settings/users')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <SidePage title="Users" sidebar={<SettingsNav />}>
            Hello "/settings/users"!
        </SidePage>
    );
}
