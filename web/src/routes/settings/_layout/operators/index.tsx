import { createFileRoute, Link } from '@tanstack/react-router';

import { OperatorDetails } from '@/components/settings/OperatorDetails';

export const Route = createFileRoute('/settings/_layout/operators/')({
    component: RouteComponent,
    context() {
        return {
            title: 'Operators',
        };
    },
});

function RouteComponent() {
    return (
        <>
            <div className="card space-y-4">
                <p>
                    Local Operators are small processes that can be run on
                    remote hardware (such as a computer somewhere in your
                    warehouse), and expose peripherals (such as readers,
                    printers, etc).{' '}
                    <Link
                        href="https://github.com/v3xlabs/v3x-property/blob/master/local-operator/README.md"
                        target="_blank"
                        className="link"
                    >
                        Learn more about setting up a local operator
                    </Link>.
                </p>
            </div>
            <OperatorDetails />
        </>
    );
}
