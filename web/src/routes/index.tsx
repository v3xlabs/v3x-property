import { createFileRoute, Link } from '@tanstack/react-router';
import { FiArrowRight } from 'react-icons/fi';

import { useInstanceStatistics } from '@/api';
import { Button } from '@/gui';
import { SCPage } from '@/layouts';

const Page = () => {
    const { data: statistics } = useInstanceStatistics();

    return (
        <SCPage title="Overview">
            <div className="card no-padding flex flex-col justify-stretch divide-y md:flex-row md:divide-x md:divide-y-0">
                <div className="grid grow grid-cols-1 gap-2 p-5 sm:grid-cols-3">
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
                    <ul className="grid h-full grid-cols-1 grid-rows-3 divide-y">
                        {[
                            ['Create an Item', '/create'],
                            ['Search for an Item', '/search'],
                            ['Adjust your settings', '/settings'],
                        ].map(([title, href]) => (
                            <li key={title}>
                                <Button variant="link" asChild>
                                    <Link to={href} className="block p-4">
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

export const Route = createFileRoute('/')({
    component: Page,
});
