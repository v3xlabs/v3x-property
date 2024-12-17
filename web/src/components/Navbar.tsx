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
import * as DropdownMenu from '@/components/ui/Dropdown';

import { Button } from './ui/Button';
import { AvatarHolder, getInitials } from './UserProfile';

const LOGIN_URL = BASE_URL + 'login';

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
        path: '/tags/',
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
    {
        path: '/media/',
        name: 'Media',
        icon: <FiImage />,
        slug: 'media-navlink',
    },
    {
        path: '/logs/',
        name: 'Logs',
        icon: <FiLogOut />,
        slug: 'logs-navlink',
    },
    {
        path: '/users/',
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
] as const;

export const Navbar = () => {
    const { token, clearAuthToken } = useAuth();
    const { data: meData } = useMe();

    const login_here_url =
        LOGIN_URL + '?redirect=' + encodeURIComponent(window.location.href);

    return (
        <nav
            role="navigation"
            aria-label="Main"
            className="w-full bg-white border-t md:border-b h-16 md:h-9 flex items-center justify-between fixed bottom-0 md:sticky md:top-0 z-10"
        >
            <Link
                to="/"
                className="hidden md:flex font-semibold cursor-pointer text-base px-4 hover:bg-black/10 border-b md:border-r h-auto items-center"
            >
                v3x.property
            </Link>
            <div className="flex w-full md:w-fit overflow-x-auto h-full">
                <ul className="grid grid-cols-5 w-full h-full md:gap-2">
                    {navLinks.map(({ path, name, icon, slug }) => (
                        <li
                            key={path}
                            className={clsx('flex-1 text-center h-full')}
                        >
                            <Link
                                to={path}
                                data-testid={slug}
                                className="flex cursor-pointer md:gap-1 h-full md:[&.active]:bg-black/10 flex-col md:flex-row items-center justify-center hover:bg-black/5 md:px-1"
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
                                    'flex flex-col md:flex-row md:gap-1 items-center justify-center hover:bg-black/5 aria-expanded:bg-black/5'
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
                                        className="flex items-center justify-start py-2.5 cursor-pointer hover:bg-black/5 rounded-md"
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
                                        className="flex items-center justify-start py-2 hover:bg-black/5 w-full md:hidden"
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
                <div className="h-full items-center gap-2 hidden md:flex">
                    {token && meData && (
                        <div className="h-full md:border-l">
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                    <button
                                        className="h-full p-1 flex items-center gap-2 px-2 hover:bg-black/5"
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
                            className="h-full border-t md:border-l px-2 py-0.5 flex items-center hover:bg-black/10"
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
