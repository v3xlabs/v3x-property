import { createFileRoute } from '@tanstack/react-router';

import { PatCreateButton } from '@/components/pat/PatCreateButton';
import { UserApiKeysTable } from '@/components/user_api_keys/UserApiKeysTable';

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
