import * as Accordion from '@radix-ui/react-accordion';
import { Link, useRouterState } from '@tanstack/react-router';
import clsx from 'clsx';
import { ReactNode, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import {
    LuBot,
    LuBrain,
    LuClipboardType,
    LuClock,
    LuFileText,
    LuHardDrive,
    LuKey,
    LuMapPin,
    LuPrinter,
    LuScroll,
    LuSearch,
    LuSettings,
    LuTag,
    LuUsers,
} from 'react-icons/lu';

import { useHasPolicy } from '@/api/policy';

export function isTruthy<T>(value?: T | undefined | null | false): value is T {
    return !!value;
}

const ExpandableItem = ({ path, label, icon }: { path: [string, string][], label: string | ReactNode, icon: ReactNode }) => {
    const x = useRouterState({
        select: (state) => state.location,
    });
    const [state, setState] = useState(path.filter(isTruthy).some(([path]) => x.pathname.startsWith(path as string)));

    return <Accordion.Root
        type="single"
        collapsible
        defaultValue={state ? label as string : undefined}
        onValueChange={(value) => {
            setState(value === label as string);
        }}
        className='w-full'
    >
        <Accordion.Item value={label as string ?? ''}>
            <div className="flex w-full flex-col">
                <Accordion.Trigger>
                    <div className={clsx(
                        'relative flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1 text-neutral-700 hover:bg-neutral-100',
                    )}>
                        <div className='flex items-center gap-2'>
                            {icon}
                            {label}
                        </div>
                        <div>
                            <FiChevronDown className={clsx('duration-300 ease-in-out', state && '[transform:rotateX(180deg)]')} />
                        </div>
                    </div>
                </Accordion.Trigger>
                <Accordion.Content className={
                    'overflow-hidden'
                }>
                    {path.map(([path, label]) => (
                        <Link
                            to={path as string}
                            activeOptions={{ exact: true }}
                            className={clsx(
                                'relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 pl-8 text-sm text-neutral-700 hover:bg-neutral-100',
                                '[&.active]:text-primary [&.active]:bg-neutral-500/10',
                                // eslint-disable-next-line quotes
                                "[&.active]:before:content-['']",
                                '[&.active]:before:absolute [&.active]:before:-left-3 [&.active]:before:bottom-[12%] [&.active]:before:top-[12%] [&.active]:before:w-1 [&.active]:before:rounded-md [&.active]:before:bg-blue-500'
                            )}
                        >
                            {label}
                        </Link>
                    ))}
                </Accordion.Content>
            </div>
        </Accordion.Item>
    </Accordion.Root>;
};

export const SettingsNav = () => {
    const { ok: hasUsersPermissions } = useHasPolicy('user', '', 'write');

    return (
        <ul className="flex flex-col divide-y">
            {(
                [
                    ['', [['/settings', 'General', <LuSettings />]]],
                    [
                        'Organizational',
                        [
                            ['/settings/tags', 'Tags', <LuTag />],
                            [
                                '/settings/fields',
                                'Field Definitions',
                                <LuClipboardType />,
                            ],
                            [
                                [
                                    ['/settings/locations', 'Overview'],
                                    ['/settings/locations/explorer', 'Explorer'],
                                ],
                                'Locations',
                                <LuMapPin />,
                            ],
                        ],
                    ],
                    [
                        'Instance',
                        [
                            ['/settings/search', 'Search', <LuSearch />],
                            ['/settings/storage', 'Storage', <LuHardDrive />],
                            [
                                '/settings/intelligence',
                                'Intelligence',
                                <LuBrain />,
                            ],
                        ],
                    ],
                    [
                        'Printing',
                        [
                            ['/settings/operators', 'Operators', <LuBot />],
                            ['/settings/templates', 'Templates', <LuFileText />],
                        ]
                    ],
                    [
                        'Authentication',
                        [
                            hasUsersPermissions && [
                                '/settings/users',
                                'Users',
                                <LuUsers />,
                            ],
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
                        [
                            ['/settings/logs', 'Access Logs', <LuScroll />],
                            ['/settings/build', 'Software Info', <LuScroll />],
                        ],
                    ],
                ] as const
            ).map(([group, items]) => (
                <div key={group}>
                    {group != '' && (
                        <h3 className="px-2 pb-1 pl-4 pt-4 text-sm font-bold text-neutral-500">
                            {group}
                        </h3>
                    )}
                    <ul className="flex flex-col pb-4 pl-2">
                        {items.filter(isTruthy).map(([path, label, icon]) => (
                            <li
                                key={path as string}
                                className={clsx('flex w-full items-center gap-1')}
                            >
                                {
                                    Array.isArray(path) ? (
                                        <ExpandableItem path={path} label={label} icon={icon} />
                                    ) : (
                                        <Link
                                            to={path as string}
                                            activeOptions={{ exact: true }}
                                            className={clsx(
                                                'relative flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-neutral-700 hover:bg-neutral-100',
                                                '[&.active]:text-primary [&.active]:bg-neutral-500/10',
                                                // eslint-disable-next-line quotes
                                                "[&.active]:before:content-['']",
                                                '[&.active]:before:absolute [&.active]:before:-left-3 [&.active]:before:bottom-[12%] [&.active]:before:top-[12%] [&.active]:before:w-1 [&.active]:before:rounded-md [&.active]:before:bg-blue-500'
                                            )}
                                        >
                                            {icon}
                                            {label}
                                        </Link>
                                    )
                                }
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </ul>
    );
};
