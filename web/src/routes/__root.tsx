import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { ReactNode } from 'react';

import { useAuth } from '@/api/auth';
import { getPublicInstanceSettings } from '@/api/instance_settings';
import { getMe } from '@/api/me';
import { Navbar } from '@/components/navigation/Navbar';
import { Toaster } from '@/gui';
import { queryClient } from '@/util/query';

export interface MyRouterContext {
    title: string;
    suffix?: ReactNode;
    showLandingPage?: boolean;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: ({ context }) => {
        console.log({ context });

        return (
            <>
                <Navbar />
                <Toaster />
                <Outlet />
            </>
        );
    },
    beforeLoad: async ({ context, location }) => {
        const settings = await queryClient.ensureQueryData(getPublicInstanceSettings());
        const { token } = useAuth.getState();
        const isAuthed = token ? await queryClient.ensureQueryData(getMe(token)) : undefined;

        return {
            showLandingPage: settings?.landing_mode && !isAuthed && location.pathname === '/',
        };
    },
});
