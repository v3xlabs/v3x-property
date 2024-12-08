import { createFileRoute } from '@tanstack/react-router';
import { FC } from 'react';

import { useAuth } from '@/api/auth';
import { BASE_URL } from '@/api/core';
import { ActiveSessionsTable } from '@/components/ActiveSessionsTable';
import { SCPage } from '@/layouts/SimpleCenterPage';

const component: FC = () => {
    return (
        <SCPage title="Active Sessions">
            <ActiveSessionsTable />
        </SCPage>
    );
};

export const Route = createFileRoute('/sessions')({
    component,
    beforeLoad: async ({ location }) => {
        if (useAuth.getState().token === null) {
            // throw redirect({
            //     to: 'https://localhost:3000/login' as any,
            //     search: {
            //         // Use the current location to power a redirect after login
            //         // (Do not use `router.state.resolvedLocation` as it can
            //         // potentially lag behind the actual current location)
            //         redirect: location.href,
            //     },
            // });

            // eslint-disable-next-line no-undef
            window.location.href =
                BASE_URL +
                '/login?redirect=' +
                encodeURIComponent(location.href);
        }
    },
});
