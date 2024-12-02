import { createLazyFileRoute } from '@tanstack/react-router';

import { SCPage } from '@/layouts/SimpleCenterPage';

export const Route = createLazyFileRoute('/products/')({
    component: () => (
        <SCPage title="Products" width="2xl">
            <div className="card">
                <p>All Products go here</p>
            </div>
        </SCPage>
    ),
});
