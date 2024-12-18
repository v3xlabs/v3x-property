import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import {
    LuBrain,
    LuClock,
    LuHardDrive,
    LuKey,
    LuScroll,
    LuSearch,
    LuSettings,
} from 'react-icons/lu';

export const SettingsNav = () => {
    return (
        <ul className="flex flex-col divide-y">
            {(
                [
                    ['', [['/settings', 'General', <LuSettings />]]],
                    [
                        'Instance Settings',
                        [
                            ['/settings/search', 'Search', <LuSearch />],
                            [
                                '/settings/intelligence',
                                'Intelligence',
                                <LuBrain />,
                            ],
                            ['/settings/storage', 'Storage', <LuHardDrive />],
                        ],
                    ],
                    [
                        'Authentication',
                        [
                            ['/settings/sessions', 'Sessions', <LuClock />],
                            [
                                '/settings/pat',
                                'Personal Access Token',
                                <LuKey />,
                            ],
                        ],
                    ],
                    [
                        'System',
                        [['/settings/build', 'Software Info', <LuScroll />]],
                    ],
                ] as const
            ).map(([group, items]) => (
                <div key={group}>
                    {group != '' && (
                        <h3 className="text-sm pt-4 px-2 pl-4 pb-1 text-neutral-500 font-bold">
                            {group}
                        </h3>
                    )}
                    <ul className="flex flex-col pb-4 pl-2">
                        {items.map(([path, label, icon]) => (
                            <li
                                key={path}
                                className={clsx('gap-1 flex items-center')}
                            >
                                <Link
                                    to={path}
                                    activeOptions={{ exact: true }}
                                    className={clsx(
                                        'py-1 px-2 hover:bg-neutral-100 rounded-md flex items-center relative gap-2 cursor-pointer w-full text-neutral-700',
                                        '[&.active]:text-primary [&.active]:bg-neutral-500/10',
                                        // eslint-disable-next-line quotes
                                        "[&.active]:before:content-['']",
                                        '[&.active]:before:absolute [&.active]:before:-left-3 [&.active]:before:top-[12%] [&.active]:before:w-1 [&.active]:before:bottom-[12%] [&.active]:before:bg-blue-500 [&.active]:before:rounded-md'
                                    )}
                                >
                                    {icon}
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </ul>
    );
};
