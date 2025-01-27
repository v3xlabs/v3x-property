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

import { BASE_URL , useAuth , useHasPolicy,useMe  } from '@/api';
import { Button,Dropdown  } from '@/gui';

import { AvatarHolder, getInitials } from '../user/UserProfile';

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
            className="bg-background fixed bottom-0 z-20 flex h-16 w-full items-center justify-between border-t md:sticky md:top-0 md:h-9 md:border-b"
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
                    <Dropdown.Root>
                        <Dropdown.Trigger asChild>
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
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                            {navLinks2.map(({ path, name, icon, slug }) => (
                                <Dropdown.Item asChild key={path}>
                                    <Link
                                        to={path}
                                        data-testid={slug}
                                        className="Text flex cursor-pointer items-center justify-start rounded-md py-2.5 hover:bg-black/5"
                                    >
                                        {icon}
                                        <span className="text-sm">{name}</span>
                                    </Link>
                                </Dropdown.Item>
                            ))}
                            <Dropdown.Separator className="md:hidden" />
                            {meData ? (
                                <Dropdown.Item asChild>
                                    <Button
                                        onClick={() => clearAuthToken()}
                                        className="flex w-full items-center justify-start py-2 hover:bg-black/5 md:hidden"
                                        variant="ghost"
                                    >
                                        <FiLogOut />
                                        <span className="text-sm">Logout</span>
                                    </Button>
                                </Dropdown.Item>
                            ) : (
                                <>
                                    <Dropdown.Item asChild>
                                        <Link
                                            to={login_here_url}
                                            className="Text flex items-center justify-center py-2 hover:bg-black/5"
                                        >
                                            <FiLogIn />
                                            <span className="text-sm">
                                                Login
                                            </span>
                                        </Link>
                                    </Dropdown.Item>
                                </>
                            )}
                        </Dropdown.Content>
                    </Dropdown.Root>
                </ul>
            </div>
            <div className="h-full">
                <div className="hidden h-full items-center gap-2 md:flex">
                    {token && meData && (
                        <div className="h-full md:border-l">
                            <Dropdown.Root>
                                <Dropdown.Trigger asChild>
                                    <button
                                        className="Text flex h-full items-center gap-2 p-1 px-2 hover:bg-black/5"
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
                                </Dropdown.Trigger>

                                <Dropdown.Content align="end" className='Text'>
                                    <Dropdown.Item asChild>
                                        <Link to="/sessions">Sessions</Link>
                                    </Dropdown.Item>
                                    <Dropdown.Item asChild>
                                        <Link to="/settings">Settings</Link>
                                    </Dropdown.Item>

                                    <Dropdown.Separator />
                                    <Dropdown.Item
                                        onClick={() => {
                                            clearAuthToken();
                                        }}
                                    >
                                        Logout
                                    </Dropdown.Item>
                                </Dropdown.Content>
                            </Dropdown.Root>
                        </div>
                    )}
                    {(!token || (token && !meData)) && (
                        <a
                            href={login_here_url}
                            className="Text flex h-full items-center border-t px-2 py-0.5 hover:bg-black/10 md:border-l"
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
