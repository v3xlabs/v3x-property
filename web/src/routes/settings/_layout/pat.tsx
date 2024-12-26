import { createFileRoute } from '@tanstack/react-router';

import { CreatePatButton } from '@/components/pat/CreatePatButton';
import { UserApiKeysTable } from '@/components/user_api_keys/UserApiKeysTable';

export const Route = createFileRoute('/settings/_layout/pat')({
    component: RouteComponent,
    context() {
        return {
            title: 'Personal Access Tokens',
            suffix: <CreatePatButton />,
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
