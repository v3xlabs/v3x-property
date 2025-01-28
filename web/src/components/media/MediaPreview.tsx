/* eslint-disable jsx-a11y/media-has-caption */
import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import { FC, lazy,Suspense, useEffect, useState  } from 'react';
import { FiEdit, FiLoader, FiTrash } from 'react-icons/fi';
import { match } from 'ts-pattern';
import { useDebouncedCallback } from 'use-debounce';

import { BASE_URL , useAuth , useInstanceSettings , useMedia } from '@/api';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/gui';

export const BareMediaPreview: FC<{
    media_id?: number;
}> = ({ media_id }) => {
    const { data: instanceSettings } = useInstanceSettings();
    const { data: media } = useMedia(media_id);

    const mediaUrl = (() => {
        const link = media?.url;

        if (link?.includes(':')) {
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

    return (
        <div className="relative aspect-video w-full rounded-md bg-neutral-100">
            {match(media?.kind)
                .with(
                    'webp',
                    'image/webp',
                    'image/avif',
                    'avif',
                    'png',
                    'image/png',
                    'svg',
                    'image/svg+xml',
                    'jpeg',
                    'jpg',
                    'image/jpeg',
                    'image/gif',
                    () => <ImagePreview media_id={media_id} url={mediaUrl} />
                )
                .with('mp4', 'video/mp4', () => (
                    <VideoPreview media_id={media_id} url={mediaUrl} />
                ))
                .with('stl', 'model/stl', () => (
                    <StlPreview media_id={media_id} url={mediaUrl} />
                ))
                .otherwise(() => (
                    <div className="h-full rounded-md border-2 border-orange-500 bg-orange-100 p-3">
                        <span>Unknown file type</span>
                        <span>{media?.kind}</span>
                    </div>
                ))}
        </div>
    );
};

export const MediaPreview: FC<{
    variant?: 'small' | 'default';
    media_id?: number;
    url?: string;
    name?: string;
    kind?: string;
    status?: string;
    update_media_id?: (_media_id: number) => void;
    delete_media?: (_media_id: number) => void;
}> = ({
    variant = 'default',
    media_id,
    url,
    name,
    kind,
    status,
    update_media_id,
    delete_media,
}) => {
    const { data: instanceSettings } = useInstanceSettings();
    const { data: media } = useMedia(media_id);

    const fileType = kind ?? media?.url.split('.').pop();
    const { token } = useAuth();

    const mediaUrl = (() => {
        const link = url ?? media?.url;

        if (link?.includes(':')) {
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

    const {
        mutate: uploadMedia,
        isIdle,
        isPending,
        isSuccess,
    } = useMutation({
        mutationFn: async () => {
            if (!mediaUrl) return;

            // artificial 5 second delay
            const formData = new FormData();

            const responsereq = await fetch(mediaUrl);
            const blob = await responsereq.blob();

            formData.append('file', blob);

            const response = await fetch(
                BASE_URL +
                    'media?name=' +
                    encodeURIComponent(name ?? '') +
                    '&kind=' +
                    encodeURIComponent(fileType ?? ''),
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const media = (await response.json()) as { media_id: number };

            // update media_id
            update_media_id?.(media.media_id);
        },
    });
    const debounced = useDebouncedCallback(uploadMedia, 200);

    useEffect(() => {
        if (!media_id && mediaUrl && isIdle) {
            debounced();
        }
    }, []);

    return (
        <div
            className={clsx(
                'relative aspect-video h-fit w-full max-w-md rounded-md bg-background',
                status == 'new-media' &&
                    isPending &&
                    'border-2 border-blue-400',
                status == 'new-media' && isIdle && 'border border-neutral-200',
                ['new-media', 'existing-media'].includes(status ?? '') &&
                    isSuccess &&
                    'border-2 border-green-400',
                status == 'removed-media' && 'border-2 border-red-400'
            )}
        >
            <BareMediaPreview media_id={media_id} />
            {isPending && (
                <div className="mt-1 flex w-full items-center justify-center gap-2 border-t-2 border-t-inherit">
                    Uploading... <FiLoader className="animate-spin" />
                </div>
            )}
            {media_id && delete_media && (
                <div className="flex items-center justify-between border-t border-t-inherit p-2">
                    <div className="pl-4">{media?.description}</div>
                    <div className="flex gap-2">
                        {delete_media && (
                            <Button
                                className=""
                                type="button"
                                onClick={() => delete_media?.(media_id)}
                            >
                                <FiTrash />
                            </Button>
                        )}
                        <Button className="" type="button">
                            <FiEdit />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const VideoPreview: FC<{ media_id?: number; url?: string }> = ({
    media_id,
    url,
}) => {
    const { data: media } = useMedia(media_id);

    return (
        <div>
            <video src={url ?? media?.url} className="h-full w-full" controls />
        </div>
    );
};

export const ImagePreview: FC<{ media_id?: number; url?: string }> = ({
    media_id,
    url,
}) => {
    const { data: media } = useMedia(media_id);
    const [imageNotFound, setImageNotFound] = useState(false);

    return (
        <div className="h-full w-full">
            {imageNotFound ? (
                <div className="h-full rounded-md border-2 border-red-500 bg-red-100 p-3">
                    <p className="font-bold">Image Preview Error</p>
                    <p>Image not found</p>
                    <code className="text-wrap break-all">
                        {url ?? media?.url}
                    </code>
                </div>
            ) : (
                <img
                    src={url ?? media?.url}
                    alt={media?.description}
                    className="h-full w-full object-contain"
                    onError={() => setImageNotFound(true)}
                />
            )}
        </div>
    );
};

const LazyStlPreviewWindow = lazy(
    () => import('@/components/media/stl_preview/StlPreview')
);

export const StlPreview: FC<{ media_id?: number; url?: string }> = ({
    media_id,
    url,
}) => {
    const { data: media } = useMedia(media_id);

    return (
        <ErrorBoundary>
            <Suspense fallback={<div>Loading...</div>}>
                <LazyStlPreviewWindow stlUrl={url ?? media?.url} />
            </Suspense>
        </ErrorBoundary>
    );
};
