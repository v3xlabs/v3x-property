/* eslint-disable jsx-a11y/media-has-caption */
import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import { FC, Suspense, useEffect, useState } from 'react';
import { FiEdit, FiLoader, FiTrash } from 'react-icons/fi';
import { match } from 'ts-pattern';
import { useDebouncedCallback } from 'use-debounce';

import { useAuth } from '@/api/auth';
import { BASE_URL } from '@/api/core';
import { useInstanceSettings } from '@/api/instance_settings';
import { useMedia } from '@/api/media';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StlPreviewWindow } from '@/components/stl_preview/StlPreview';

import { Button } from '../ui/Button';

export const MediaPreview: FC<{
    media_id?: number;
    url?: string;
    name?: string;
    kind?: string;
    status?: string;
    update_media_id?: (_media_id: number) => void;
    delete_media?: (_media_id: number) => void;
}> = ({ media_id, url, name, kind, status, update_media_id, delete_media }) => {
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
                'relative aspect-video bg-neutral-100 max-w-md w-full rounded-md',
                status == 'new-media' &&
                    isPending &&
                    'border-blue-400 border-2',
                status == 'new-media' && isIdle && 'border-neutral-200 border',
                ['new-media', 'existing-media'].includes(status ?? '') &&
                    isSuccess &&
                    'border-green-400 border-2',
                status == 'removed-media' && 'border-red-400 border-2'
            )}
        >
            {match(fileType)
                .with(
                    'webp',
                    'image/webp',
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
                    <div className="p-3 border-orange-500 border-2 rounded-md bg-orange-100 h-full">
                        <span>Unknown file type</span>
                        <span>{fileType}</span>
                    </div>
                ))}
            {isPending && (
                <div className="flex items-center gap-2 justify-center w-full border-t-2 border-t-inherit mt-1">
                    Uploading... <FiLoader className="animate-spin" />
                </div>
            )}
            {media_id && (
                <div className="flex justify-between items-center p-2 border-t-inherit border-t">
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
            <video src={url ?? media?.url} className="w-full h-full" controls />
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
        <div className="w-full h-full">
            {imageNotFound ? (
                <div className="p-3 border-red-500 border-2 rounded-md bg-red-100 h-full">
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
                    className="w-full h-full object-contain"
                    onError={() => setImageNotFound(true)}
                />
            )}
        </div>
    );
};

export const StlPreview: FC<{ media_id?: number; url?: string }> = ({
    media_id,
    url,
}) => {
    const { data: media } = useMedia(media_id);

    return (
        <ErrorBoundary>
            <Suspense fallback={<div>Loading...</div>}>
                <StlPreviewWindow stlUrl={url ?? media?.url} />
            </Suspense>
        </ErrorBoundary>
    );
};
