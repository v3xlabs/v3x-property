import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { useAuth } from '@/api/auth';
import { BASE_URL } from '@/api/core';
import { getInstanceSettings } from '@/api/instance_settings';
import { useMe } from '@/api/me';
import { SearchTaskTable } from '@/components/search_tasks/SearchTaskTable';
import { BuildDetails } from '@/components/settings/BuildDetails';
import { InstanceSettings } from '@/components/settings/InstanceSettings';
import { Button } from '@/components/ui/Button';
import { UserApiKeysTable } from '@/components/user_api_keys/UserApiKeysTable';
import { UserProfile } from '@/components/UserProfile';
import { SCPage } from '@/layouts/SimpleCenterPage';
import { queryClient } from '@/util/query';

export const Route = createFileRoute('/settings/')({
    loader: async () => {
        await queryClient.ensureQueryData(getInstanceSettings);
    },
    component: () => {
        const { token, clearAuthToken } = useAuth();
        const { mutate: indexAllItems } = useMutation({
            mutationFn: async () => {
                const response = await fetch(BASE_URL + 'search/reindex', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                return response.json();
            },
        });
        const { data: meData } = useMe();

        return (
            <SCPage title="Settings">
                {meData && (
                    <div className="card">
                        <UserProfile user_id={meData.user_id} />
                    </div>
                )}
                <div className="card flex flex-row gap-2">
                    <Button onClick={() => indexAllItems()}>
                        Index All Items
                    </Button>
                    <Button onClick={() => clearAuthToken()} variant="warning">
                        Logout
                    </Button>
                </div>
                <div className="card">
                    <InstanceSettings />
                </div>
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
