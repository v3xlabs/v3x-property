import { createFileRoute } from '@tanstack/react-router';

import { BuildDetails } from '@/components/settings/BuildDetails';
import { SettingsNav } from '@/components/settings/nav';
import { SidePage } from '@/layouts/SidebarPage';

export const Route = createFileRoute('/settings/build')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <SidePage title="Software Info" sidebar={<SettingsNav />}>
            <BuildDetails />
        </SidePage>
    );
}
