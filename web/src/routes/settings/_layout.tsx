import {
    createFileRoute,
    Outlet,
    useRouteContext,
    useRouterState,
} from '@tanstack/react-router';

import { SettingsNav } from '@/components/settings/nav';
import { SidePage } from '@/layouts/SidebarPage';

export const Route = createFileRoute('/settings/_layout')({
    component: RouteComponent,
});

function RouteComponent() {
    const matches = useRouterState({ select: (s) => s.matches });

    // @ts-expect-error
    // eslint-disable-next-line prefer-destructuring
    const title = matches[matches.length - 1].context['title'];

    return (
        <SidePage title={title} sidebar={<SettingsNav />}>
            <Outlet />
        </SidePage>
    );
}
