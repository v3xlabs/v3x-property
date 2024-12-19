import { createFileRoute } from '@tanstack/react-router';

import { useUsers } from '@/api/user';
import { UserProfile } from '@/components/UserProfile';

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
            <p className="text-sm text-gray-500 px-4">
                With OAuth configured users will get automatically added here as
                soon as they log in the for the first time.
            </p>
        </>
    );
}
