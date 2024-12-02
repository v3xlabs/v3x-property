import * as Avatar from '@radix-ui/react-avatar';
import * as HoverCard from '@radix-ui/react-hover-card';
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import { FC } from 'react';
import { match } from 'ts-pattern';

import { formatId, useInstanceSettings } from '@/api/instance_settings';
import { ApiItemResponse, useApiItemById } from '@/api/item';

type Properties = {
    item_id: string;
    variant?: 'avatar' | 'full' | 'compact';
};

export const AvatarHolder: FC<{
    image?: string;
    initials?: string;
    alt?: string;
    size?: 'compact' | 'default';
}> = ({ image, initials, alt, size }) => {
    return (
        <Avatar.Root
            className={clsx('AvatarRoot', size === 'compact' && '!size-6')}
        >
            {image && (
                <Avatar.Image
                    className={clsx(
                        'AvatarImage',
                        size === 'compact' && '!size-6'
                    )}
                    src={image}
                    alt={alt || 'User Avatar'}
                />
            )}
            <Avatar.Fallback
                className={clsx(
                    'AvatarFallback',
                    size === 'compact' && '!text-[0.6em]'
                )}
                delayMs={600}
            >
                {initials || 'X'}
            </Avatar.Fallback>
        </Avatar.Root>
    );
};

export const ItemPreviewHoverCard: FC<{
    item?: ApiItemResponse;
}> = ({ item }) => {
    const { data: instanceSettings } = useInstanceSettings();
    const formattedItemId = formatId(item?.item_id, instanceSettings);

    return (
        <HoverCard.Content className="HoverCardContent border" sideOffset={5}>
            <div className="flex flex-col gap-3">
                <AvatarHolder image={item?.name} initials={''} />
                <div className="flex flex-col gap-3">
                    <div>
                        <div className="Text bold">{item?.name}</div>
                        <div className="Text faded">#{formattedItemId}</div>
                    </div>
                    {/* <div className="Text">
                                        Components, icons, colors, and templates
                                        for building high-quality, accessible
                                        UI. Free and open-source.
                                    </div> */}
                    <div className="flex gap-3">
                        <div className="flex gap-1">
                            <div className="Text bold">0</div>{' '}
                            <div className="Text faded">Following</div>
                        </div>
                        <div className="flex gap-1">
                            <div className="Text bold">2,900</div>{' '}
                            <div className="Text faded">Followers</div>
                        </div>
                    </div>
                </div>
            </div>

            <HoverCard.Arrow className="HoverCardArrow" />
        </HoverCard.Content>
    );
};

const UNKNOWN_USER = 'Unknown User';

export const ItemPreview: FC<Properties> = ({ item_id, variant }) => {
    const { data: item, isLoading } = useApiItemById(item_id);
    const { data: instanceSettings } = useInstanceSettings();
    const formattedItemId = formatId(item?.item_id, instanceSettings);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {match({ variant })
                .with({ variant: 'avatar' }, () => (
                    <HoverCard.Root>
                        <HoverCard.Trigger asChild>
                            <Link
                                to={`/item/${formattedItemId}`}
                                className="p-1 border rounded-md flex items-center gap-2 hover:bg-black/5"
                            >
                                <AvatarHolder
                                    image={item?.name}
                                    initials={''}
                                />
                            </Link>
                        </HoverCard.Trigger>
                        <ItemPreviewHoverCard item={item!} />
                    </HoverCard.Root>
                ))
                .with({ variant: 'compact' }, () => (
                    <HoverCard.Root>
                        <HoverCard.Trigger asChild>
                            <Link
                                to={`/item/${formattedItemId}`}
                                className="p-1.5 border cursor-pointer rounded-md flex items-center gap-2 hover:bg-black/5"
                            >
                                <AvatarHolder
                                    image={item?.name}
                                    initials={''}
                                    size="compact"
                                />
                                <span className="Text !leading-[0.75em]">
                                    {item?.name || UNKNOWN_USER}
                                </span>
                            </Link>
                        </HoverCard.Trigger>
                        <ItemPreviewHoverCard item={item!} />
                    </HoverCard.Root>
                ))
                .otherwise(() => (
                    <HoverCard.Root>
                        <HoverCard.Trigger asChild>
                            <Link
                                to={`/item/${formattedItemId}`}
                                className="p-1.5 border cursor-pointer rounded-md flex items-center gap-2 hover:bg-black/5"
                            >
                                <AvatarHolder
                                    image={item?.name}
                                    initials={''}
                                />
                                <div className="flex flex-col gap-1 justify-center">
                                    <div className="Text !leading-[0.75em]">
                                        {item?.name || UNKNOWN_USER}
                                    </div>
                                    <div className="Text faded !leading-[0.75em]">
                                        #{formattedItemId}
                                    </div>
                                </div>
                            </Link>
                        </HoverCard.Trigger>
                        <ItemPreviewHoverCard item={item!} />
                    </HoverCard.Root>
                ))}
        </div>
    );
};
