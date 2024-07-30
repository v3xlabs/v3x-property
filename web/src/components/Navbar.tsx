/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-undef */
import { Link } from '@tanstack/react-router';

import { useAuth } from '../api/auth';
import { useApiMe } from '../api/me';

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
            {meData && (
                <div className="h-full border-l px-2 hover:bg-black/10 relative">
                    <div className="h-full p-1 flex items-center gap-2">
                        <div className="h-full aspect-square bg-black/10">
                            <img
                                src={meData?.picture}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div>{meData.name}</div>
                        <div className="absolute right-0 w-fit top-full bg-white border">
                            <div className="px-3 py-0.5">Hello</div>
                            <button
                                className="px-3 py-0.5 hover:bg-black/10"
                                onClick={() => {
                                    clearAuthToken();
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {!token && (
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
