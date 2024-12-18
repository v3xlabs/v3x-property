import { createFileRoute } from '@tanstack/react-router';

import { SettingsNav } from '@/components/settings/nav';
import { StorageDetails } from '@/components/settings/StorageDetails';
import { SidePage } from '@/layouts/SidebarPage';

export const Route = createFileRoute('/settings/storage')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <SidePage title="Storage" sidebar={<SettingsNav />}>
            <StorageDetails />
        </SidePage>
    );
}
