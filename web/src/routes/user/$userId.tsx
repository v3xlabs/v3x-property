import { createFileRoute, useParams } from '@tanstack/react-router';

import { useUserById } from '@/api/user';
import { SCPage } from '@/layouts/SimpleCenterPage';

export const Route = createFileRoute('/user/$userId')({
    component: () => {
        const { userId } = useParams({ from: '/user/$userId' });
        const user_id = Number.parseInt(userId);
        const { data: user, isLoading } = useUserById({
            variables: { user_id },
        });

        return (
            <SCPage title="User Profile">
                <div className="flex flex-col gap-4">
                    <div>{user?.name}</div>
                </div>
            </SCPage>
        );
    },
});
