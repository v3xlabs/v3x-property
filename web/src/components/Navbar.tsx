/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-undef */
import { Link } from '@tanstack/react-router';
import { FileRoutesByPath } from '@tanstack/react-router';

import { useAuth } from '@/api/auth';
import { useApiMe } from '@/api/me';
import * as DropdownMenu from '@/components/ui/Dropdown';

import { AvatarHolder, getInitials } from './UserProfile';

const LOGIN_URL = 'http://localhost:3000/api/login';

export const Navbar = () => {
    const { token, clearAuthToken } = useAuth();
    const { data: meData, isLoading: isVerifyingAuth } = useApiMe();

    const login_here_url =
        LOGIN_URL + '?redirect=' + encodeURIComponent(window.location.href);

    console.log({ meData });

    return (
        <div className="w-full bg-white border-b h-8 flex items-center justify-between">
            <div className="h-full flex space-x-2">
                <Link
                    to="/"
                    className="font-semibold cursor-pointer text-base px-4 hover:bg-black/10 border-r h-full flex items-center"
                >
                    v3x.property
                </Link>
                <div className="h-full flex items-center">
                    {(
                        [
                            ['/search', 'Search', 'search-navlink'],
                            ['/items', 'Items', 'items-navlink'],
                            ['/products', 'Products', 'products-navlink'],
                            ['/logs', 'Logs', 'logs-navlink'],
                            ['/create', 'Create', 'create-navlink'],
                        ] as [keyof FileRoutesByPath, string, string][]
                    ).map(([path, name, slug]) => (
                        <Link
                            key={path}
                            to={path}
                            data-testid={slug}
                            className="[&.active]:bg-black/10 hover:bg-black/5 py-1 px-2 cursor-pointer"
                        >
                            {name}
                        </Link>
                    ))}
                </div>
            </div>
            {token && meData && (
                <div className="h-full border-l">
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button
                                className="h-full p-1 flex items-center gap-2 px-2 hover:bg-black/5"
                                data-testid="user-dropdown-trigger"
                            >
                                {/* <div className="h-full aspect-square bg-black/10 relative">
                                    <img
                                        src={meData?.picture}
                                        className="w-full h-full object-contain"
                                    />
                                </div> */}
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
                    className="h-full border-l px-2 py-0.5 flex items-center hover:bg-black/10"
                    data-testid="login-button"
                >
                    Login
                </a>
            )}
        </div>
    );
};
