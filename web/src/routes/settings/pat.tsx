import { createFileRoute } from '@tanstack/react-router';

import { SettingsNav } from '@/components/settings/nav';
import { UserApiKeysTable } from '@/components/user_api_keys/UserApiKeysTable';
import { SidePage } from '@/layouts/SidebarPage';

export const Route = createFileRoute('/settings/pat')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <SidePage title="Personal Access Token" sidebar={<SettingsNav />}>
            <div className="card">
                <UserApiKeysTable />
            </div>
        </SidePage>
    );
}
