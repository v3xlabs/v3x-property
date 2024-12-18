import { createFileRoute } from '@tanstack/react-router';

import { AllLogsSection } from '@/components/logs/AllLogsSection';
import { SettingsNav } from '@/components/settings/nav';
import { SidePage } from '@/layouts/SidebarPage';

export const Route = createFileRoute('/settings/logs/')({
    component: () => {
        return (
            <SidePage title="Logs" width="2xl" sidebar={<SettingsNav />}>
                <div className="card">
                    <p>
                        Logs are emitted anytime an item is created, edited, or
                        updated. This pages provides a full overview of all logs
                        on this instance.
                    </p>
                </div>
                <AllLogsSection />
            </SidePage>
        );
    },
});
