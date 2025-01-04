import { createFileRoute } from '@tanstack/react-router';

import { useUsers } from '@/api';
import { UserProfile } from '@/components/user/UserProfile';

export const Route = createFileRoute('/settings/_layout/users')({
    component: RouteComponent,
    context() {
        return {
            title: 'Users',
        };
    },
});

function RouteComponent() {
    const { data } = useUsers();

    return (
        <>
            <ul className="space-y-2">
                {data
                    ?.filter((user) => user.user_id !== 1)
                    .map((user) => (
                        <li key={user.user_id}>
                            <div className="card no-padding p-2">
                                <UserProfile
                                    user_id={user.user_id}
                                    variant="full"
                                />
                            </div>
                        </li>
                    ))}
            </ul>
            <p className="px-4 text-sm text-gray-500">
                With OAuth configured users will get automatically added here as
                soon as they log in the for the first time.
            </p>
        </>
    );
}
