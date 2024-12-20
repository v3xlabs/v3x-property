import * as Avatar from '@radix-ui/react-avatar';
import * as HoverCard from '@radix-ui/react-hover-card';
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import { FC, Fragment } from 'react';
import { FaAmazon, FaBarcode } from 'react-icons/fa6';
import { match } from 'ts-pattern';

import { ApiError } from '@/api/core';
import { useItemFields } from '@/api/fields/item';
import { formatId, useInstanceSettings } from '@/api/instance_settings';
import { ApiItemResponse, useItemById, useItemLocation, useItemMedia, useItemTags } from '@/api/item';
import { useMedia } from '@/api/media';

import { LocationPreview } from '../location/LocationPreview';
import { Tag } from '../Tag';

const UNKNOWN_ITEM = 'Unknown Item';

type Properties = {
    item_id: string;
    variant?: 'avatar' | 'full' | 'compact' | 'large';
    image_url?: string;
};

export const deriveRandomHue = (item_id?: string) => {
    if (!item_id) {
        return;
    }

    // Use a non-linear transformation to spread out sequential numbers
    const hash = item_id.split('').reduce((accumulator, char, index) => {
        const charCode = char.codePointAt(0) ?? 0;

        // Use prime numbers and position-based multipliers to add more entropy
        return accumulator + ((charCode * 31 ** index) % 997);
    }, 0);

    // Add a final transformation to spread the values more evenly
    return (hash * 17 + 359) % 360;
};

export const AvatarHolder: FC<{
    item_id?: string;
    image?: string;
    alt?: string;
    size?: 'compact' | 'default' | 'large';
    randomHue?: number;
}> = ({ item_id, image, alt, size, randomHue }) => {
    return (
        <div
            className={clsx(
                {
                    compact: 'size-6',
                    default: 'w-11 h-11',
                    large: 'size-32',
                }[size ?? 'default'],
                'aspect-square'
            )}
        >
            <Avatar.Root
                className={clsx(
                    'inline-flex size-8 h-full w-full select-none items-center justify-center overflow-hidden rounded-md align-middle'
                )}
            >
                {image && (
                    <Avatar.Image
                        className={clsx(
                            'h-full w-full object-contain',
                            size === 'compact' && '!size-6'
                        )}
                        src={image}
                        alt={alt || 'Unknown Item'}
                    />
                )}
                <Avatar.Fallback
                    className={clsx(
                        'flex h-full w-full items-center justify-center bg-gray-200 text-base font-medium leading-none text-pink-500',
                        size === 'compact' && '!text-[0.6em]'
                    )}
                    delayMs={0}
                >
                    <img
                        className={clsx(
                            'h-full w-full object-cover',
                            size === 'compact' && '!size-6'
                        )}
                        src="/default_cube2.webp"
                        alt={alt || UNKNOWN_ITEM}
                        style={
                            randomHue
                                ? {
                                    filter: `sepia(100%) hue-rotate(${randomHue}deg)`,
                                }
                                : undefined
                        }
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
    const randomHue = deriveRandomHue(item?.item_id);

    return (
        <HoverCard.Content className="HoverCardContent border" sideOffset={5}>
            <div className="flex flex-col gap-3">
                <AvatarHolder
                    item_id={item?.item_id}
                    image={mediaUrl}
                    key={`media-${item?.item_id}`}
                    randomHue={randomHue}
                />
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

const ItemPreviewLarge: FC<{
    item?: ApiItemResponse;
    isError?: boolean;
    mediaUrl?: string;
    formattedItemId?: string;
}> = ({ item, isError, mediaUrl, formattedItemId }) => {
    const { data: fields } = useItemFields(item?.item_id);
    const { data: location } = useItemLocation(item?.item_id);
    const { data: tags } = useItemTags(item?.item_id);

    const randomHue = deriveRandomHue(item?.item_id);
    const logos = fields?.map((field) => {
        return match(field)
            .with(
                { definition_id: 'upc' },
                { definition_id: 'ean' },
                { definition_id: 'gtin' },
                (_) => {
                    return (
                        <div
                            className="rounded-md border p-1"
                            key={field.definition_id}
                        >
                            <FaBarcode />
                        </div>
                    );
                }
            )
            .with({ definition_id: 'asin' }, (_) => {
                return (
                    <div
                        className="rounded-md border p-1"
                        key={field.definition_id}
                    >
                        <FaAmazon />
                    </div>
                );
            })
            .otherwise((field) => (
                <Fragment key={field.definition_id}></Fragment>
            ));
    });

    return (
        <Link
            to={`/item/${formattedItemId}`}
            className={clsx(
                'relative flex cursor-pointer flex-col items-start gap-4 rounded-md border p-2 outline-1 outline-offset-1 outline-neutral-200 hover:outline md:flex-row',
                isError && 'bg-red-50'
            )}
            data-testid="item-preview-large"
        >
            {formattedItemId && (
                <div className="bg-background absolute left-0 top-0 z-10 rounded-br-md rounded-tl-md border-b border-r px-1 py-0.5 text-sm">#{formattedItemId}</div>
            )}
            <div className="mx-auto md:mx-0">
                <AvatarHolder
                    item_id={item?.item_id}
                    image={mediaUrl}
                    alt={item?.name || UNKNOWN_ITEM}
                    size="large"
                    key={`media-${item?.item_id}`}
                    randomHue={randomHue}
                />
            </div>
            <div className="flex max-w-full grow flex-col justify-center -space-y-1.5 overflow-hidden py-4">
                <div className='grow'>
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap text-base">
                        {item?.name || UNKNOWN_ITEM}
                    </div>
                    {
                        tags && tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tags?.map((tag) => (
                                    <Tag key={tag.tag_id} tag={tag} variant='compact' />
                                ))}
                            </div>
                        )
                    }
                    {logos && logos.length > 0 && (
                        <ul className="flex items-center gap-2 py-2">{logos}</ul>
                    )}
                </div>
                {/* {item?.owner_id && (
                    <UserProfile user_id={item.owner_id} variant="compact" />
                )} */}
            </div>
            <div className="flex h-full w-full items-end justify-between gap-2 md:w-auto md:flex-col md:justify-end">
                {location?.location_user_id == item?.owner_id && (<span className='text-end text-xs leading-tight text-neutral-500'>with owner</span>) }
                {location && location.location_user_id != item?.owner_id && (
                    <div className="w-fit">
                        <LocationPreview itemLocation={location} variant="compact" />
                    </div>
                )}
            </div>
        </Link>
    );
};

export const ItemPreviewLargeSkeleton: FC<{
    formattedItemId?: string;
}> = ({ formattedItemId }) => {
    return (
        <div
            className={clsx(
                'flex cursor-pointer items-start gap-4 rounded-md border p-2 outline-1 outline-offset-1 outline-neutral-200 hover:outline'
            )}
            data-testid="item-preview-large"
        >
            <div className="size-32 animate-pulse rounded-md bg-neutral-200" />
            {/* <AvatarHolder
                item_id={item?.item_id}
                image={mediaUrl}
                alt={item?.name || UNKNOWN_ITEM}
                size="large"
                key={`media-${item?.item_id}`}
                randomHue={randomHue}
            /> */}
            <div className="flex grow flex-col justify-center -space-y-1.5 overflow-hidden py-4">
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-base">
                    {UNKNOWN_ITEM}
                </div>
                {formattedItemId && (
                    <div className="text-sm">#{formattedItemId}</div>
                )}
                {/* {logos && logos.length > 0 && (
                    <ul className="flex items-center gap-2 py-2">{logos}</ul>
                )} */}
            </div>
            <div className="flex h-full">
                {/* {item?.owner_id && (
                    <UserProfile user_id={item.owner_id} variant="compact" />
                )} */}
            </div>
        </div>
    );
};

export const ItemPreview: FC<Properties> = ({ item_id, variant }) => {
    const { data: item, isLoading, isError, error } = useItemById(item_id);
    const { data: media } = useItemMedia(item_id);
    const { data: mediaData } = useMedia(media?.[0]);
    const { data: instanceSettings } = useInstanceSettings();
    const formattedItemId = formatId(item?.item_id, instanceSettings);
    const randomHue = deriveRandomHue(item?.item_id);
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
        return match({ variant })
            .with({ variant: 'large' }, () => (
                <ItemPreviewLargeSkeleton formattedItemId={formattedItemId} />
            ))
            .otherwise(() => <div>Loading...</div>);
    }

    if (isError && error instanceof ApiError && error.status === 403) {
        return (
            <div className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5">
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
                                    'flex items-center gap-2 rounded-md border p-1 hover:bg-black/5',
                                    isError && 'bg-red-50'
                                )}
                                data-testid="item-preview-avatar"
                            >
                                <AvatarHolder
                                    item_id={item?.item_id}
                                    image={mediaUrl}
                                    alt={item?.name || UNKNOWN_ITEM}
                                    key={`media-${item?.item_id}`}
                                    randomHue={randomHue}
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
                                    'inline-flex cursor-pointer items-center gap-2 rounded-md border p-1.5 hover:bg-black/5',
                                    isError && 'bg-red-50'
                                )}
                                data-testid="item-preview-compact"
                            >
                                <AvatarHolder
                                    item_id={item?.item_id}
                                    image={mediaUrl}
                                    size="compact"
                                    alt={item?.name || UNKNOWN_ITEM}
                                    key={`media-${item?.item_id}`}
                                    randomHue={randomHue}
                                />
                                <span className="flex items-baseline justify-start gap-0.5 overflow-hidden">
                                    <span className="Text text-ellipsis whitespace-nowrap">
                                        {item?.name || UNKNOWN_ITEM}
                                    </span>
                                    {/* TODO: Figure out why -z-10 is needed to prevent overlap with user preview in logs page */}
                                    {formattedItemId && (
                                        <span className="-z-10 text-xs !leading-[1em] opacity-50">
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
                .with({ variant: 'large' }, () => (
                    <ItemPreviewLarge
                        item={item}
                        isError={isError}
                        mediaUrl={mediaUrl}
                        formattedItemId={formattedItemId}
                    />
                ))
                .otherwise(() => (
                    <HoverCard.Root>
                        <HoverCard.Trigger asChild>
                            <Link
                                to={`/item/${formattedItemId}`}
                                className={clsx(
                                    'flex cursor-pointer items-center gap-2 rounded-md border p-1.5 hover:bg-black/5',
                                    isError && 'bg-red-50'
                                )}
                                data-testid="item-preview-full"
                            >
                                <AvatarHolder
                                    image={mediaUrl}
                                    alt={item?.name || UNKNOWN_ITEM}
                                    key={`media-${item?.item_id}`}
                                    randomHue={randomHue}
                                />
                                <div className="flex flex-col justify-center -space-y-1.5 overflow-hidden">
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
