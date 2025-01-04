import { createFileRoute } from '@tanstack/react-router';

import { PatCreateButton } from '@/components/user/pat/PatCreateButton';
import { UserApiKeysTable } from '@/components/user/pat/UserApiKeysTable';

export const Route = createFileRoute('/settings/_layout/pat')({
    component: RouteComponent,
    context() {
        return {
            title: 'Personal Access Tokens',
            suffix: <PatCreateButton />,
        };
    },
});

function RouteComponent() {
    return (
        <div className="card">
            <UserApiKeysTable />
        </div>
    );
}
