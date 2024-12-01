import { createLazyFileRoute } from '@tanstack/react-router';

import { SCPage } from '../../layouts/SimpleCenterPage';

export const Route = createLazyFileRoute('/settings/')({
    component: () => <SCPage title="Settings">Hello /settings!</SCPage>,
});
