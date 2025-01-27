import * as Avatar from '@radix-ui/react-avatar';
import * as HoverCard from '@radix-ui/react-hover-card';
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import { FC } from 'react';
import { match } from 'ts-pattern';

import { ApiMeResponse, useMe, useUserById } from '@/api';

type Properties = {
    user_id: number;
    variant?: 'avatar' | 'full' | 'compact';
};

export const AvatarHolder: FC<{
    image?: string;
    initials?: string;
    alt?: string;
    size?: 'compact' | 'default' | 'navbar';
}> = ({ image, initials, alt, size }) => {
    return (
        <Avatar.Root
            className={clsx(
                'inline-flex h-11 w-11 select-none items-center justify-center overflow-hidden rounded-full bg-gray-300 align-middle',
                size === 'compact' && '!size-6',
                size === 'navbar' && '!size-4'
            )}
        >
            {image && (
                <Avatar.Image
                    className={clsx(
                        'h-full w-full object-cover',
                        size === 'compact' && '!size-6',
                        size === 'navbar' && '!size-4'
                    )}
                    src={image}
                    alt={alt || 'User Avatar'}
                />
            )}
            <Avatar.Fallback
                className={clsx(
                    'flex h-full w-full items-center justify-center bg-gray-200 text-base font-medium leading-none text-pink-500',
                    size === 'compact' && '!text-[0.6em]',
                    size === 'navbar' && '!text-[0.5em]'
                )}
                delayMs={600}
            >
                {initials || 'X'}
            </Avatar.Fallback>
        </Avatar.Root>
    );
};

export const UserProfileHoverCard: FC<{
    user?: ApiMeResponse;
}> = ({ user }) => {
    return (
        <HoverCard.Content className="HoverCardContent border" sideOffset={5}>
            <div className="flex flex-col gap-3">
                <AvatarHolder
                    image={user?.picture}
                    initials={getInitials(user?.name)}
                />
                <div className="flex flex-col gap-3">
                    <div>
                        <div className="text-foreground bold">{user?.name}</div>
                        <div className="text-foreground faded">#{user?.user_id}</div>
                    </div>
                    {/* <div className="text-foreground">
                                        Components, icons, colors, and templates
                                        for building high-quality, accessible
                                        UI. Free and open-source.
                                    </div> */}
                    <div className="flex gap-3">
                        <div className="flex gap-1">
                            <div className="text-foreground bold">0</div>{' '}
                            <div className="text-foreground faded">Following</div>
                        </div>
                        <div className="flex gap-1">
                            <div className="text-foreground bold">2,900</div>{' '}
                            <div className="text-foreground faded">Followers</div>
                        </div>
                    </div>
                </div>
            </div>

            <HoverCard.Arrow className="HoverCardArrow" />
        </HoverCard.Content>
    );
};

export const getInitials = (name?: string) => {
    if (!name) return '';

    // Split the name into parts and get first letter of each part
    return name
        .split(' ')
        .map((part) => part[0])
        .join('');
};

const UNKNOWN_USER = 'Unknown User';

export const UserProfile: FC<Properties> = ({ user_id, variant }) => {
    const { data: user, isLoading } = useUserById(user_id);
    const { data: me } = useMe();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {match({ variant })
                .with({ variant: 'avatar' }, () => (
                    <HoverCard.Root>
                        <HoverCard.Trigger asChild>
                            <Link
                                to="/user/$userId"
                                params={{ userId: user_id.toString() }}
                                className="flex items-center gap-2 rounded-md border p-1 hover:bg-black/5"
                            >
                                <AvatarHolder
                                    image={user?.picture}
                                    initials={getInitials(user?.name)}
                                />
                            </Link>
                        </HoverCard.Trigger>
                        <UserProfileHoverCard user={user!} />
                    </HoverCard.Root>
                ))
                .with({ variant: 'compact' }, () => (
                    <HoverCard.Root>
                        <HoverCard.Trigger asChild>
                            <Link
                                to="/user/$userId"
                                params={{ userId: user_id.toString() }}
                                className="flex cursor-pointer items-center gap-2 rounded-md border px-1.5 py-1 hover:bg-black/5"
                            >
                                <AvatarHolder
                                    image={user?.picture}
                                    initials={getInitials(user?.name)}
                                    size="compact"
                                />
                                <span className="text-foreground !leading-[0.75em]">
                                    {user?.first_name ||
                                        user?.name ||
                                        UNKNOWN_USER}
                                </span>
                            </Link>
                        </HoverCard.Trigger>
                        <UserProfileHoverCard user={user!} />
                    </HoverCard.Root>
                ))
                .otherwise(() => (
                    <HoverCard.Root>
                        <HoverCard.Trigger asChild>
                            <Link
                                to="/user/$userId"
                                params={{ userId: user_id.toString() }}
                                className="flex min-w-48 cursor-pointer items-center gap-2 rounded-md border p-1.5 hover:bg-black/5"
                            >
                                <AvatarHolder
                                    image={user?.picture}
                                    initials={getInitials(user?.name)}
                                />
                                <div className="flex flex-col justify-center gap-1">
                                    <div className="text-foreground !leading-[0.75em]">
                                        {user?.name || UNKNOWN_USER}
                                    </div>
                                    <div className="text-foreground faded !leading-[0.75em]">
                                        {me?.user_id === user?.user_id
                                            ? 'You'
                                            : `#${user?.user_id}`}
                                    </div>
                                </div>
                            </Link>
                        </HoverCard.Trigger>
                        <UserProfileHoverCard user={user!} />
                    </HoverCard.Root>
                ))}
        </>
    );
};
