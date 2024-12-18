import { createFileRoute } from '@tanstack/react-router';

import { SearchTaskTable } from '@/components/search_tasks/SearchTaskTable';
import { SettingsNav } from '@/components/settings/nav';
import { SearchDetails } from '@/components/settings/SearchDetails';
import { SidePage } from '@/layouts/SidebarPage';

export const Route = createFileRoute('/settings/search')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <SidePage title="Search" sidebar={<SettingsNav />}>
            <SearchDetails />
            <div className="card">
                <SearchTaskTable />
            </div>
        </SidePage>
    );
}
