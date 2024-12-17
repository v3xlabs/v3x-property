import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { useAuth } from '@/api/auth';
import { getInstanceSettings } from '@/api/instance_settings';
import { useMe } from '@/api/me';
import { SearchTaskTable } from '@/components/search_tasks/SearchTaskTable';
import { BuildDetails } from '@/components/settings/BuildDetails';
import { InstanceSettings } from '@/components/settings/InstanceSettings';
import { IntelligenceDetails } from '@/components/settings/IntelligenceDetails';
import { SearchDetails } from '@/components/settings/SearchDetails';
import { StorageDetails } from '@/components/settings/StorageDetails';
import { Button } from '@/components/ui/Button';
import { UserApiKeysTable } from '@/components/user_api_keys/UserApiKeysTable';
import { UserProfile } from '@/components/UserProfile';
import { SCPage } from '@/layouts/SimpleCenterPage';
import { queryClient } from '@/util/query';

export const Route = createFileRoute('/settings/')({
    loader: async () => {
        await queryClient.ensureQueryData(getInstanceSettings());
    },
    component: () => {
        const { token, clearAuthToken } = useAuth();
        const { data: instanceSettings } = useSuspenseQuery(
            getInstanceSettings()
        );
        const { data: meData } = useMe();

        return (
            <SCPage title="Settings">
                {meData && (
                    <div className="card flex justify-between items-center">
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
                <SearchDetails />
                <IntelligenceDetails />
                <StorageDetails />
                <BuildDetails />
                <div className="card">
                    <SearchTaskTable />
                </div>
                <div className="card">
                    <UserApiKeysTable />
                </div>
            </SCPage>
        );
    },
});
