import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { useAuth } from '@/api/auth';
import { getInstanceSettings } from '@/api/instance_settings';
import { useMe } from '@/api/me';
import { InstanceSettings } from '@/components/settings/InstanceSettings';
import { Button } from '@/components/ui/Button';
import { UserProfile } from '@/components/UserProfile';
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
                    <div className="card flex items-center justify-between">
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
