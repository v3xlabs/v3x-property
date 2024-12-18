import { createFileRoute } from '@tanstack/react-router';

import { IntelligenceDetails } from '@/components/settings/IntelligenceDetails';
import { SettingsNav } from '@/components/settings/nav';
import { SidePage } from '@/layouts/SidebarPage';

export const Route = createFileRoute('/settings/intelligence')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <SidePage title="Intelligence" sidebar={<SettingsNav />}>
            <IntelligenceDetails />
        </SidePage>
    );
}
