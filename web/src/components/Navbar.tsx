/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-undef */
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import { useState } from 'react';
import {
    FiBox,
    FiLogIn,
    FiLogOut,
    FiPlusCircle,
    FiSearch,
    FiSettings,
    FiTag,
} from 'react-icons/fi';

import { useAuth } from '@/api/auth';
import { BASE_URL } from '@/api/core';
import { useMe } from '@/api/me';
import * as DropdownMenu from '@/components/ui/Dropdown';

import { AvatarHolder, getInitials } from './UserProfile';

const LOGIN_URL = BASE_URL + 'login';

export const Navbar = () => {
    const { token, clearAuthToken } = useAuth();
    const { data: meData, isLoading: isVerifyingAuth } = useMe();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const login_here_url =
        LOGIN_URL + '?redirect=' + encodeURIComponent(window.location.href);

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
        {
            path: '/logs/',
            name: 'Logs',
            icon: <FiLogOut />,
            slug: 'logs-navlink',
            desktopOnly: true,
        },
    ];

    return (
        <nav
            role="navigation"
            aria-label="Main"
            className="w-full bg-white border-t md:border-b h-16 md:h-auto flex items-center justify-between md:justify-start fixed bottom-0 md:sticky md:top-0 z-10"
        >
            <div className="flex md:hidden w-full overflow-x-auto">
                <ul className="grid grid-cols-5 w-full">
                    {navLinks.map(({ path, name, icon, slug, desktopOnly }) => (
                        <li
                            key={path}
                            className={clsx(
                                'flex-1 text-center',
                                desktopOnly && 'hidden md:block'
                            )}
                        >
                            <Link
                                to={path}
                                data-testid={slug}
                                className="flex flex-col items-center justify-center py-2 hover:bg-black/5"
                            >
                                {icon}
                                <span className="text-xs">{name}</span>
                            </Link>
                        </li>
                    ))}
                    {meData ? (
                        <li>
                            <Link
                                to="/settings"
                                className="flex flex-col items-center justify-center py-2 hover:bg-black/5"
                            >
                                <FiSettings />
                                <span className="text-xs">Settings</span>
                            </Link>
                        </li>
                    ) : (
                        <li>
                            <Link
                                to={login_here_url}
                                className="flex flex-col items-center justify-center py-2 hover:bg-black/5"
                            >
                                <FiLogIn />
                                <span className="text-xs">Login</span>
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
            <div
                className={clsx(
                    'hidden md:flex md:items-center md:justify-between w-full'
                )}
            >
                <Link
                    to="/"
                    className="font-semibold cursor-pointer text-base px-4 hover:bg-black/10 border-b md:border-r h-full flex items-center"
                >
                    v3x.property
                </Link>
                <ul className="h-full flex flex-row items-center space-x-2">
                    {navLinks.map(({ path, name, icon, slug }) => (
                        <li key={path}>
                            <Link
                                to={path}
                                data-testid={slug}
                                className="flex items-center space-x-1 [&.active]:bg-black/10 hover:bg-black/5 py-1 px-2 cursor-pointer"
                            >
                                {icon}
                                <span>{name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
                <div className="flex items-center gap-2">
                    {token && meData && (
                        <div className="h-full border-t md:border-l">
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

                                <DropdownMenu.Content sideOffset={5}>
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
