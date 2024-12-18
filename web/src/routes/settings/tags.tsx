import { createFileRoute } from '@tanstack/react-router';

import { SettingsNav } from '@/components/settings/nav';
import { SidePage } from '@/layouts/SidebarPage';

export const Route = createFileRoute('/settings/tags')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <SidePage title="Tags" sidebar={<SettingsNav />}>
            <div>Hello "/settings/tags"!</div>
        </SidePage>
    );
}
