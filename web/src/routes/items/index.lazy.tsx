import { createLazyFileRoute } from '@tanstack/react-router';

import { SCPage } from '../../layouts/SimpleCenterPage';

export const Route = createLazyFileRoute('/items/')({
    component: () => (
        <SCPage title="Items" width="2xl">
            <div className="card">
                <p>All Items go here</p>
            </div>
        </SCPage>
    ),
});
