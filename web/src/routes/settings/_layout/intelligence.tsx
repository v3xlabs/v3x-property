import { createFileRoute } from '@tanstack/react-router';

import { IntelligenceDetails } from '@/components/settings/IntelligenceDetails';

export const Route = createFileRoute('/settings/_layout/intelligence')({
    component: RouteComponent,
    context() {
        return {
            title: 'Intelligence',
        };
    },
});

function RouteComponent() {
    return <IntelligenceDetails />;
}
