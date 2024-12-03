import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import { FC, Suspense, useEffect, useState } from 'react';
import { FiEdit, FiLoader } from 'react-icons/fi';
import { match } from 'ts-pattern';

import { useAuth } from '@/api/auth';
import { BASE_URL } from '@/api/core';
import { useMedia } from '@/api/media';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StlPreviewWindow } from '@/components/stl_preview/StlPreview';

import { Button } from '../ui/Button';

export const MediaPreview: FC<{
    media_id?: number;
    url?: string;
    kind?: string;
    update_media_id?: (_media_id: number) => void;
}> = ({ media_id, url, kind, update_media_id }) => {
    const { data: media } = useMedia(media_id);

    const fileType = kind ?? media?.url.split('.').pop();
    const { token } = useAuth();

    const {
        mutate: uploadMedia,
        isIdle,
        isPending,
        isSuccess,
    } = useMutation({
        mutationFn: async () => {
            if (!url) return;

            // artificial 5 second delay
            const formData = new FormData();

            const responsereq = await fetch(url);
            const blob = await responsereq.blob();

            formData.append('file', blob);

            const response = await fetch(
                BASE_URL +
                    '/api/media?name=test&kind=' +
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

    useEffect(() => {
        if (!media_id && url && isIdle) {
            uploadMedia();
        }
    }, []);

    return (
        <div
            className={clsx(
                'relative aspect-video bg-neutral-100 max-w-md w-full rounded-md',
                isPending && 'border-blue-400 border-2',
                isIdle && 'border-neutral-200 border',
                isSuccess && 'border-green-400 border-2'
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
                    'image/jpeg',
                    () => <ImagePreview media_id={media_id} url={url} />
                )
                .with('stl', 'model/stl', () => (
                    <StlPreview media_id={media_id} url={url} />
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
                    <Button className="">
                        <FiEdit />
                    </Button>
                </div>
            )}
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
                    <code>{url ?? media?.url}</code>
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
