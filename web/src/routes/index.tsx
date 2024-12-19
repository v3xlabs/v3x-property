import { createFileRoute, createRootRouteWithContext, Link } from '@tanstack/react-router';
import { FiArrowRight } from 'react-icons/fi';

import { useInstanceStatistics } from '@/api/instance_settings';
import { Button } from '@/components/ui/Button';
import { SCPage } from '@/layouts/SimpleCenterPage';

const Page = () => {
    const { data: statistics } = useInstanceStatistics();

    return (
        <SCPage title="Overview">
            <div className="card flex justify-stretch no-padding md:divide-y-0 divide-y md:divide-x flex-col md:flex-row">
                <div className="gap-2 grid grid-cols-1 sm:grid-cols-3 grow p-5">
                    {[
                        ['Items', statistics?.item_count],
                        ['Products', 0],
                        ['Media', statistics?.media_count],
                        ['Logs', statistics?.log_count],
                        ['Users', statistics?.user_count],
                    ].map(([title, value]) => (
                        <div>
                            <b>{title}</b>
                            <p className="font-mono">{value}</p>
                        </div>
                    ))}
                </div>
                <div className="w-full md:w-1/3 md:max-w-[33%]">
                    <ul className="grid grid-cols-1 grid-rows-3 h-full divide-y">
                        {[
                            ['Create an Item', '/create'],
                            ['Search for an Item', '/search'],
                            ['Adjust your settings', '/settings'],
                        ].map(([title, href]) => (
                            <li key={title}>
                                <Button variant="link" asChild>
                                    <Link to={href} className="p-4 block">
                                        <span>{title}</span>
                                        <FiArrowRight />
                                    </Link>
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </SCPage>
    );
};

export interface MyRouterContext {
    title: string;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: Page,
});
