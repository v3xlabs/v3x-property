import { createFileRoute, Link } from '@tanstack/react-router';
import { FiArrowRight, FiGithub } from 'react-icons/fi';

import { useAuth, useInstanceStatistics, useMe, usePublicInstanceSettings } from '@/api';
import { ItemPreview } from '@/components/item/ItemPreview';
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
                            <li key={title} className="flex items-center">
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
    component: ({ context }) => {
        console.log('context', context);

        // const settings = await queryClient.ensureQueryData(getPublicInstanceSettings());
        const { data: settings, isLoading } = usePublicInstanceSettings();
        // const { token } = useAuth.getState();
        const { token } = useAuth();
        // const isAuthed = token ? await queryClient.ensureQueryData(getMe(token)) : undefined;
        const { data: meData, isLoading: isAuthedLoading } = useMe();
        const isAuthed = token && meData?.user_id;

        if (isAuthedLoading || isLoading) {
            return <div>Loading...</div>;
        }

        if (settings?.landing_mode && !isAuthed) {
            console.log('Landing mode is enabled', isAuthed);

            return <LandingPage />;
        }

        return <Page />;
    },
});

export const LandingPage = () => {
    return (
        <SCPage title="V3X Property" width="2xl">
            <div className="card space-y-2">
                <p>
                    Property aims to be a novel way to manage your personal assets. Wether these are physical items, digital assets, or things alike. Keep track of items, their location, history, with multi-user support.
                </p>
                <div>
                    <ItemPreview item_id='20' />
                </div>
            </div>
            <div className="flex justify-evenly gap-3">
                <Button variant="secondary" asChild>
                    <a href="https://github.com/v3xlabs/v3x-property" target="_blank" className="w-full">
                        <FiGithub />
                        <span>Github</span>
                    </a>
                </Button>
                <Button variant="default" asChild>
                    <a href="https://github.com/v3xlabs/v3x-property#run-your-own-instance" target="_blank" className="w-full">
                        <FiArrowRight />
                        <span>Try it out</span>
                    </a>
                </Button>
            </div>
        </SCPage>
    );
};
