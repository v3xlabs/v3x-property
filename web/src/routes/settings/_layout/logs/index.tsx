import { createFileRoute } from '@tanstack/react-router';

import { AllLogsSection } from '@/components/logs/AllLogsSection';

export const Route = createFileRoute('/settings/_layout/logs/')({
    context() {
        return {
            title: 'Logs',
        };
    },
    component: () => {
        return (
            <div className="space-y-4">
                <div className="card">
                    <p>
                        Logs are emitted anytime an item is created, edited, or
                        updated. This pages provides a full overview of all logs
                        on this instance.
                    </p>
                </div>
                <AllLogsSection />
            </div>
        );
    },
});
