import { createFileRoute } from '@tanstack/react-router';

import { useAuth } from '@/api/auth';
import { BASE_URL } from '@/api/core';
import { ActiveSessionsTable } from '@/components/ActiveSessionsTable';
import { SCPage } from '@/layouts/SimpleCenterPage';

export const Route = createFileRoute('/sessions')({
    component: () => {
        return (
            <SCPage title="Active Sessions">
                <ActiveSessionsTable />
            </SCPage>
        );
    },
    beforeLoad: async ({ location }) => {
        if (useAuth.getState().token === null) {
            // eslint-disable-next-line no-undef
            window.location.href =
                BASE_URL +
                'login' +
                '?redirect=' +
                encodeURIComponent(location.href);
        }
    },
});
