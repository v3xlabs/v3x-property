import * as Avatar from '@radix-ui/react-avatar';
import * as HoverCard from '@radix-ui/react-hover-card';
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import { FC } from 'react';
import { match } from 'ts-pattern';

import { ApiError } from '@/api/core';
import { formatId, useInstanceSettings } from '@/api/instance_settings';
import { ApiItemResponse, useItemById, useItemMedia } from '@/api/item';
import { useMedia } from '@/api/media';

const UNKNOWN_ITEM = 'Unknown Item';

type Properties = {
    item_id: string;
    variant?: 'avatar' | 'full' | 'compact';
    image_url?: string;
};

export const AvatarHolder: FC<{
    image?: string;
    alt?: string;
    size?: 'compact' | 'default';
}> = ({ image, alt, size }) => {
    return (
        <div
            className={clsx(
                size === 'compact' ? '!size-6' : 'w-11 h-11',
                'aspect-square'
            )}
        >
            <Avatar.Root
                className={clsx(
                    'inline-flex items-center justify-center align-middle overflow-hidden select-none w-full h-full rounded-md size-8'
                )}
            >
                {image && (
                    <Avatar.Image
                        className={clsx(
                            'w-full h-full object-contain',
                            size === 'compact' && '!size-6'
                        )}
                        src={image}
                        alt={alt || 'Unknown Item'}
                    />
                )}
                <Avatar.Fallback
                    className={clsx(
                        'w-full h-full flex items-center justify-center bg-gray-200 text-pink-500 text-base leading-none font-medium',
                        size === 'compact' && '!text-[0.6em]'
                    )}
                    delayMs={600}
                >
                    <img
                        className={clsx(
                            'w-full h-full object-cover',
                            size === 'compact' && '!size-6'
                        )}
                        src="/default_cube.webp"
                        alt={alt || UNKNOWN_ITEM}
                    />
                </Avatar.Fallback>
            </Avatar.Root>
        </div>
    );
};

export const ItemPreviewHoverCard: FC<{
    item?: ApiItemResponse;
    mediaUrl?: string;
}> = ({ item, mediaUrl }) => {
    const { data: instanceSettings } = useInstanceSettings();
    const formattedItemId = formatId(item?.item_id, instanceSettings);

    return (
        <HoverCard.Content className="HoverCardContent border" sideOffset={5}>
            <div className="flex flex-col gap-3">
                <AvatarHolder image={mediaUrl} />
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
                        {/* <div className="flex gap-1">
                            <div className="Text bold">0</div>{' '}
                            <div className="Text faded">Following</div>
                        </div>
                        <div className="flex gap-1">
                            <div className="Text bold">2,900</div>{' '}
                            <div className="Text faded">Followers</div>
                        </div> */}
                    </div>
                </div>
            </div>

            <HoverCard.Arrow className="HoverCardArrow" />
        </HoverCard.Content>
    );
};

export const ItemPreview: FC<Properties> = ({ item_id, variant }) => {
    const { data: item, isLoading, isError, error } = useItemById(item_id);
    const { data: media } = useItemMedia(item_id);
    const { data: mediaData } = useMedia(media?.[0]);
    const { data: instanceSettings } = useInstanceSettings();
    const formattedItemId = formatId(item?.item_id, instanceSettings);

    const mediaUrl = (() => {
        const link = mediaData?.url;

        if (!link) {
            return;
        }

        if (link.includes(':')) {
            return link;
        }

        if (!instanceSettings) {
            return;
        }

        return (
            instanceSettings.modules.storage.endpoint_url +
            '/' +
            instanceSettings.modules.storage.bucket +
            '/' +
            link
        );
    })();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError && error instanceof ApiError && error.status === 403) {
        return (
            <div className="bg-red-50 px-2 py-0.5 border border-red-200 rounded-md">
                Inaccessible Resource
            </div>
        );
    }

    return (
        <div>
            {match({ variant })
                .with({ variant: 'avatar' }, () => (
                    <HoverCard.Root>
                        <HoverCard.Trigger asChild>
                            <Link
                                to={`/item/${formattedItemId}`}
                                className={clsx(
                                    'p-1 border rounded-md flex items-center gap-2 hover:bg-black/5',
                                    isError && 'bg-red-50'
                                )}
                                data-testid="item-preview-avatar"
                            >
                                <AvatarHolder
                                    image={mediaUrl}
                                    alt={item?.name || UNKNOWN_ITEM}
                                />
                            </Link>
                        </HoverCard.Trigger>
                        <ItemPreviewHoverCard
                            item={item!}
                            mediaUrl={mediaUrl}
                        />
                    </HoverCard.Root>
                ))
                .with({ variant: 'compact' }, () => (
                    <HoverCard.Root>
                        <HoverCard.Trigger asChild>
                            <Link
                                to={`/item/${formattedItemId}`}
                                className={clsx(
                                    'p-1.5 border cursor-pointer rounded-md inline-flex items-center gap-2 hover:bg-black/5',
                                    isError && 'bg-red-50'
                                )}
                                data-testid="item-preview-compact"
                            >
                                <AvatarHolder
                                    image={mediaUrl}
                                    size="compact"
                                    alt={item?.name || UNKNOWN_ITEM}
                                />
                                <span className="flex gap-0.5 items-baseline justify-start overflow-hidden">
                                    <span className="Text text-ellipsis whitespace-nowrap">
                                        {item?.name || UNKNOWN_ITEM}
                                    </span>
                                    {/* TODO: Figure out why -z-10 is needed to prevent overlap with user preview in logs page */}
                                    {formattedItemId && (
                                        <span className="opacity-50 text-xs !leading-[1em] -z-10">
                                            #{formattedItemId}
                                        </span>
                                    )}
                                </span>
                            </Link>
                        </HoverCard.Trigger>
                        <ItemPreviewHoverCard
                            item={item!}
                            mediaUrl={mediaUrl}
                        />
                    </HoverCard.Root>
                ))
                .otherwise(() => (
                    <HoverCard.Root>
                        <HoverCard.Trigger asChild>
                            <Link
                                to={`/item/${formattedItemId}`}
                                className={clsx(
                                    'p-1.5 border cursor-pointer rounded-md flex items-center gap-2 hover:bg-black/5',
                                    isError && 'bg-red-50'
                                )}
                                data-testid="item-preview-full"
                            >
                                <AvatarHolder
                                    image={mediaUrl}
                                    alt={item?.name || UNKNOWN_ITEM}
                                />
                                <div className="flex flex-col -space-y-1.5 justify-center overflow-hidden">
                                    <div className="Text overflow-hidden text-ellipsis whitespace-nowrap">
                                        {item?.name || UNKNOWN_ITEM}
                                    </div>
                                    {formattedItemId && (
                                        <div className="Text faded">
                                            #{formattedItemId}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        </HoverCard.Trigger>
                        <ItemPreviewHoverCard
                            item={item!}
                            mediaUrl={mediaUrl}
                        />
                    </HoverCard.Root>
                ))}
        </div>
    );
};
