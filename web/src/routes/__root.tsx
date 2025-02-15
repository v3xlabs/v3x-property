import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { ReactNode } from 'react';

import { Navbar } from '@/components/navigation/Navbar';
import { Toaster } from '@/gui';

export interface MyRouterContext {
  title: string;
  suffix?: ReactNode;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: () => (
        <>
            <Navbar />
            <Toaster />
            <Outlet />
        </>
    ),
});
