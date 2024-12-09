import { ErrorRouteComponent, Link } from '@tanstack/react-router';

import { ApiError, BASE_URL } from '@/api/core';
import { useMe } from '@/api/me';
import { SCPage } from '@/layouts/SimpleCenterPage';

import { Button } from './ui/Button';

export const PageErrorBoundary: ErrorRouteComponent = ({
    error,
    info,
    reset,
}) => {
    if (error instanceof ApiError && [401, 403].includes(error.status)) {
        const login_here_url =
            BASE_URL +
            'login?redirect=' +
            encodeURIComponent(window.location.href);
        const { data: meData } = useMe();

        return (
            <SCPage title="Unauthorized">
                <div className="card space-y-4">
                    <div>You are not authorized to access this page</div>
                    {/* <Button onClick={reset}>Retry</Button> */}
                    {!meData && (
                        <div className="flex items-center justify-between w-full">
                            Try logging in.
                            <Button asChild>
                                <Link
                                    to={login_here_url}
                                    data-testid="login-button"
                                >
                                    Login
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </SCPage>
        );
    }

    return (
        <SCPage title="Error Report">
            <div className="card">
                <div>Looks like there was an issue here</div>
                <div>{error.message}</div>
            </div>
            <div>{JSON.stringify(info)}</div>
        </SCPage>
    );
};
