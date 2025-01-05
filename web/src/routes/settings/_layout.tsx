import {
    createFileRoute,
    Outlet,
    useRouterState,
} from '@tanstack/react-router';

import { SettingsNav } from '@/components/settings/nav';
import { SidePage } from '@/layouts';

export const Route = createFileRoute('/settings/_layout')({
    component: RouteComponent,
});

function RouteComponent() {
    const matches = useRouterState({ select: (s) => s.matches });

    const { title, suffix } = matches[matches.length - 1].context;

    return (
        <SidePage
            title={title}
            suffix={suffix}
            sidebar={<SettingsNav />}
            children={<Outlet />}
        />
    );
}
