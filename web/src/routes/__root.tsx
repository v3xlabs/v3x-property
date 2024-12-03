import { createRootRoute, Outlet } from '@tanstack/react-router';

import { Navbar } from '@/components/Navbar';
import { Toaster } from '@/components/ui/Toaster';

export const Route = createRootRoute({
    component: () => (
        <>
            <Navbar />
            <Toaster />
            <Outlet />
            {/* <TanStackRouterDevtools /> */}
        </>
    ),
});
