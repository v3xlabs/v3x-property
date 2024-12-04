import { useMutation } from '@tanstack/react-query';
import { createLazyFileRoute } from '@tanstack/react-router';

import { useAuth } from '@/api/auth';
import { BASE_URL } from '@/api/core';
import { useInstanceSettings } from '@/api/instance_settings';
import { SearchTaskTable } from '@/components/search_tasks/SearchTaskTable';
import { Button } from '@/components/ui/Button';
import { SCPage } from '@/layouts/SimpleCenterPage';

export const Route = createLazyFileRoute('/settings/')({
    component: () => {
        const { data: instanceSettings } = useInstanceSettings();
        const { token } = useAuth();
        const { mutate: indexAllItems } = useMutation({
            mutationFn: async () => {
                const response = await fetch(BASE_URL + '/api/search/reindex', {
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
                    <h2>Instance Settings</h2>
                    <pre className="bg-black/5 p-4 rounded-lg">
                        {JSON.stringify(instanceSettings, undefined, 2)}
                    </pre>
                </div>
                <div className="card">
                    <SearchTaskTable />
                </div>
            </SCPage>
        );
    },
});
