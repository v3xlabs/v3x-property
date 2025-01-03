/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-undef */
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import {
    FiBox,
    FiChevronDown,
    FiImage,
    FiLogIn,
    FiLogOut,
    FiMapPin,
    FiMoreHorizontal,
    FiPlusCircle,
    FiSearch,
    FiSettings,
    FiTag,
    FiUsers,
} from 'react-icons/fi';

import { useAuth } from '@/api/auth';
import { BASE_URL } from '@/api/core';
import { useMe } from '@/api/me';
import { useHasPolicy } from '@/api/policy';
import * as DropdownMenu from '@/components/ui/Dropdown';

import { Button } from './ui/Button';
import { AvatarHolder, getInitials } from './UserProfile';

const LOGIN_URL = BASE_URL + 'login';

export const Navbar = () => {
    const { token, clearAuthToken } = useAuth();
    const { data: meData } = useMe();
    const { ok: hasUsersPermissions } = useHasPolicy('user', '', 'write');
    const { ok: hasLocationsPermissions } = useHasPolicy('location', '', 'write');

    const navLinks = [
        {
            path: '/items',
            name: 'Items',
            icon: <FiBox />,
            slug: 'items-navlink',
        },
        {
            path: '/products',
            name: 'Products',
            icon: <FiTag />,
            slug: 'products-navlink',
        },
        {
            path: '/search',
            name: 'Search',
            icon: <FiSearch />,
            slug: 'search-navlink',
        },
        {
            path: '/create',
            name: 'Create',
            icon: <FiPlusCircle />,
            slug: 'create-navlink',
        },
    ] as const;

    const navLinks2 = [
        {
            path: '/settings/tags',
            name: 'Tags',
            icon: <FiTag />,
            slug: 'tags-navlink',
        },
        {
            path: '/settings/fields',
            name: 'Fields',
            icon: <FiTag />,
            slug: 'fields-navlink',
        },
        hasLocationsPermissions && {
            path: '/settings/locations',
            name: 'Locations',
            icon: <FiMapPin />,
            slug: 'locations-navlink',
        },
        {
            path: '/media/',
            name: 'Media',
            icon: <FiImage />,
            slug: 'media-navlink',
        },
        {
            path: '/settings/logs',
            name: 'Logs',
            icon: <FiLogOut />,
            slug: 'logs-navlink',
        },
        hasUsersPermissions && {
            path: '/settings/users',
            name: 'Users',
            icon: <FiUsers />,
            slug: 'users-navlink',
        },
        {
            path: '/settings',
            name: 'Settings',
            icon: <FiSettings />,
            slug: 'settings-navlink',
        },
    ].filter(Boolean);

    const login_here_url =
        LOGIN_URL + '?redirect=' + encodeURIComponent(window.location.href);

    return (
        <nav
            role="navigation"
            aria-label="Main"
            className="fixed bottom-0 z-20 flex h-16 w-full items-center justify-between border-t bg-white md:sticky md:top-0 md:h-9 md:border-b"
        >
            <Link
                to="/"
                className="hidden h-full cursor-pointer items-center px-4 text-base font-semibold hover:bg-black/10 md:flex md:border-r"
            >
                v3x.property
            </Link>
            <div className="flex h-full w-full overflow-x-auto md:w-fit">
                <ul className="grid h-full w-full grid-cols-5 md:flex md:gap-2">
                    {navLinks.map(({ path, name, icon, slug }) => (
                        <li
                            key={path}
                            className={clsx('h-full flex-1 text-center')}
                        >
                            <Link
                                to={path}
                                data-testid={slug}
                                className="flex h-full cursor-pointer flex-col items-center justify-center hover:bg-black/5 md:flex-row md:gap-1 md:px-2 md:[&.active]:bg-black/10"
                            >
                                {icon}
                                <span className="text-xs md:text-base">
                                    {name}
                                </span>
                            </Link>
                        </li>
                    ))}
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button
                                className={
                                    'flex flex-col items-center justify-center hover:bg-black/5 aria-expanded:bg-black/5 md:flex-row md:gap-1 md:px-2'
                                }
                                data-testid="more-dropdown-trigger"
                            >
                                <FiMoreHorizontal className="block md:hidden" />
                                <span className="text-xs md:text-base">
                                    More
                                </span>
                                <FiChevronDown className="hidden md:block" />
                            </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content>
                            {navLinks2.map(({ path, name, icon, slug }) => (
                                <DropdownMenu.Item asChild key={path}>
                                    <Link
                                        to={path}
                                        data-testid={slug}
                                        className="flex cursor-pointer items-center justify-start rounded-md py-2.5 hover:bg-black/5"
                                    >
                                        {icon}
                                        <span className="text-sm">{name}</span>
                                    </Link>
                                </DropdownMenu.Item>
                            ))}
                            <DropdownMenu.Separator className="md:hidden" />
                            {meData ? (
                                <DropdownMenu.Item asChild>
                                    <Button
                                        onClick={() => clearAuthToken()}
                                        className="flex w-full items-center justify-start py-2 hover:bg-black/5 md:hidden"
                                        variant="ghost"
                                    >
                                        <FiLogOut />
                                        <span className="text-sm">Logout</span>
                                    </Button>
                                </DropdownMenu.Item>
                            ) : (
                                <>
                                    <DropdownMenu.Item asChild>
                                        <Link
                                            to={login_here_url}
                                            className="flex items-center justify-center py-2 hover:bg-black/5"
                                        >
                                            <FiLogIn />
                                            <span className="text-sm">
                                                Login
                                            </span>
                                        </Link>
                                    </DropdownMenu.Item>
                                </>
                            )}
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                </ul>
            </div>
            <div className="h-full">
                <div className="hidden h-full items-center gap-2 md:flex">
                    {token && meData && (
                        <div className="h-full md:border-l">
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                    <button
                                        className="flex h-full items-center gap-2 p-1 px-2 hover:bg-black/5"
                                        data-testid="user-dropdown-trigger"
                                    >
                                        <AvatarHolder
                                            initials={getInitials(meData.name)}
                                            image={meData.picture}
                                            size="compact"
                                        />
                                        <div data-testid="user-dropdown-name">
                                            {meData.name}
                                        </div>
                                    </button>
                                </DropdownMenu.Trigger>

                                <DropdownMenu.Content align="end">
                                    <DropdownMenu.Item asChild>
                                        <Link to="/sessions">Sessions</Link>
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item asChild>
                                        <Link to="/settings">Settings</Link>
                                    </DropdownMenu.Item>

                                    <DropdownMenu.Separator />
                                    <DropdownMenu.Item
                                        onClick={() => {
                                            clearAuthToken();
                                        }}
                                    >
                                        Logout
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Root>
                        </div>
                    )}
                    {(!token || (token && !meData)) && (
                        <a
                            href={login_here_url}
                            className="flex h-full items-center border-t px-2 py-0.5 hover:bg-black/10 md:border-l"
                            data-testid="login-button"
                        >
                            Login
                        </a>
                    )}
                </div>
            </div>
        </nav>
    );
};
