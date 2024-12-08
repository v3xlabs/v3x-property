import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { useAuth } from '@/api/auth';
import { BASE_URL } from '@/api/core';
import { getInstanceSettings } from '@/api/instance_settings';
import { SearchTaskTable } from '@/components/search_tasks/SearchTaskTable';
import { InstanceSettings } from '@/components/settings/InstanceSettings';
import { Button } from '@/components/ui/Button';
import { UserApiKeysTable } from '@/components/user_api_keys/UserApiKeysTable';
import { SCPage } from '@/layouts/SimpleCenterPage';
import { queryClient } from '@/util/query';

export const Route = createFileRoute('/settings/')({
    loader: async () => {
        await queryClient.ensureQueryData(getInstanceSettings);
    },
    component: () => {
        const { token } = useAuth();
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

        return (
            <SCPage title="Settings">
                <div className="card">
                    Hello /settings!
                    <Button onClick={() => indexAllItems()}>
                        Index All Items
                    </Button>
                </div>
                <div className="card">
                    <InstanceSettings />
                </div>
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
