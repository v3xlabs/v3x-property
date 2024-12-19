import { createFileRoute, Link } from '@tanstack/react-router';
import { FiHeart } from 'react-icons/fi';

import { BuildDetails } from '@/components/settings/BuildDetails';

export const Route = createFileRoute('/settings/_layout/build')({
    component: RouteComponent,
    context() {
        return {
            title: 'Software Info',
        };
    },
});

function RouteComponent() {
    return (
        <>
            <BuildDetails />
            <p className="flex items-center gap-1 px-4 text-sm text-gray-500">
                We thank you for using open-source software.{' '}
                <Link
                    href="https://v3x.company"
                    className="link"
                    target="_blank"
                >
                    V3X Labs
                </Link>{' '}
                <FiHeart className="text-xs" />
            </p>
        </>
    );
}
