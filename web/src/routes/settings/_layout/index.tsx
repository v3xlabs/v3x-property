import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { getInstanceSettings, useAuth, useMe } from '@/api';
import { InstanceSettings } from '@/components/settings/InstanceSettings';
import { UserProfile } from '@/components/user/UserProfile';
import { Button } from '@/gui';
import { queryClient } from '@/util/query';

export const Route = createFileRoute('/settings/_layout/')({
    loader: async () => {
        await queryClient.ensureQueryData(getInstanceSettings());
    },
    context() {
        return {
            title: 'Settings',
        };
    },
    component: () => {
        const { token, clearAuthToken } = useAuth();
        const { data: instanceSettings } = useSuspenseQuery(
            getInstanceSettings()
        );
        const { data: meData } = useMe();

        return (
            <>
                {meData && (
                    <div className="card flex items-center justify-between gap-2">
                        <UserProfile user_id={meData.user_id} />
                        <Button
                            onClick={() => clearAuthToken()}
                            variant="warning"
                        >
                            Logout
                        </Button>
                    </div>
                )}
                <InstanceSettings />
            </>
        );
    },
});
