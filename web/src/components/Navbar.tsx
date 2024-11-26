/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-undef */
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Link } from '@tanstack/react-router';

import { useAuth } from '../api/auth';
import { useApiMe } from '../api/me';
import { AvatarHolder, getInitials } from './UserProfile';

const LOGIN_URL = 'http://localhost:3000/login';

export const Navbar = () => {
    const { token, clearAuthToken } = useAuth();
    const { data: meData, isLoading: isVerifyingAuth } = useApiMe();

    const login_here_url =
        LOGIN_URL + '?redirect=' + encodeURIComponent(window.location.href);

    console.log({ meData });

    return (
        <div className="w-full bg-white border-b h-8 flex items-center justify-between">
            <div className="h-full flex space-x-2">
                <div className="font-semibold text-base pl-4 pr-4 hover:bg-black/10 border-r h-full flex items-center">
                    v3x.property
                </div>
                <div className="h-full flex items-center">
                    {[
                        ['/', 'Home'],
                        ['/create', 'Create'],
                        ['/sessions', 'Sessions'],
                    ].map(([path, name]) => (
                        <Link
                            key={path}
                            to={path}
                            className="[&.active]:font-bold hover:bg-black/10 py-1 px-2"
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
                            <button className="h-full p-1 flex items-center gap-2 px-2 hover:bg-black/5">
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
                                <div>{meData.name}</div>
                            </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                className="DropdownMenuContent"
                                sideOffset={5}
                            >
                                <DropdownMenu.Item className="DropdownMenuItem">
                                    Settings
                                </DropdownMenu.Item>
                                <DropdownMenu.Item asChild>
                                    <Link
                                        to="/sessions"
                                        className="DropdownMenuItem"
                                    >
                                        Sessions
                                    </Link>
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    className="DropdownMenuItem"
                                    onClick={() => {
                                        clearAuthToken();
                                    }}
                                >
                                    Logout
                                </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                </div>
            )}
            {(!token || (token && !meData)) && (
                <a
                    href={login_here_url}
                    className="h-full border-l px-2 py-0.5 flex items-center hover:bg-black/10"
                >
                    Login
                </a>
            )}
        </div>
    );
};
