import { createFileRoute } from '@tanstack/react-router';

import { SearchTaskTable } from '@/components/search_tasks/SearchTaskTable';
import { SearchDetails } from '@/components/settings/SearchDetails';

export const Route = createFileRoute('/settings/_layout/search')({
    component: RouteComponent,
    context() {
        return {
            title: 'Search',
        };
    },
});

function RouteComponent() {
    return (
        <>
            <SearchDetails />
            <div className="card">
                <SearchTaskTable />
            </div>
        </>
    );
}
