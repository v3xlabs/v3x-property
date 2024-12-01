import { createLazyFileRoute } from '@tanstack/react-router';

import { SCPage } from '../../layouts/SimpleCenterPage';

export const Route = createLazyFileRoute('/logs/')({
    component: () => (
        <SCPage title="Logs" width="2xl">
            <div className="card">
                <p>Recent logs</p>
            </div>
            <div className="card">
                <p>Search for logs</p>
            </div>
        </SCPage>
    ),
});
