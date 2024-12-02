import { createLazyFileRoute } from '@tanstack/react-router';

import { useInstanceSettings } from '@/api/instance_settings';
import { SearchTaskTable } from '@/components/search_tasks/SearchTaskTable';
import { SCPage } from '@/layouts/SimpleCenterPage';

export const Route = createLazyFileRoute('/settings/')({
    component: () => {
        const { data: instanceSettings } = useInstanceSettings();

        return (
            <SCPage title="Settings">
                <div className="card">Hello /settings!</div>
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
