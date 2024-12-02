import { createLazyFileRoute } from '@tanstack/react-router';

import { SCPage } from '@/layouts/SimpleCenterPage';

export const Route = createLazyFileRoute('/settings/')({
    component: () => (
        <SCPage title="Settings">
            <div className="card">Hello /settings!</div>
        </SCPage>
    ),
});
