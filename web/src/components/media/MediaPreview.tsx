import { FC, Suspense, useState } from 'react';
import { match } from 'ts-pattern';

import { useMedia } from '@/api/media';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StlPreviewWindow } from '@/components/stl_preview/StlPreview';

export const MediaPreview: FC<{ media_id: number; edit?: boolean }> = ({
    media_id,
    edit,
}) => {
    const { data: media } = useMedia(media_id);

    const fileType = media?.url.split('.').pop();

    return (
        <div className="aspect-video bg-neutral-100 max-w-md w-full border border-neutral-200 rounded-md">
            {match(fileType)
                .with('webp', () => <ImagePreview media_id={media_id} />)
                .with('stl', () => <StlPreview media_id={media_id} />)
                .otherwise(() => (
                    <div className="p-3 border-orange-500 border-2 rounded-md bg-orange-100 h-full">
                        <span>Unknown file type</span>
                        <span>{fileType}</span>
                    </div>
                ))}
        </div>
    );
};

export const ImagePreview: FC<{ media_id: number }> = ({ media_id }) => {
    const { data: media } = useMedia(media_id);
    const [imageNotFound, setImageNotFound] = useState(false);

    return (
        <div className="w-full h-full">
            {imageNotFound ? (
                <div className="p-3 border-red-500 border-2 rounded-md bg-red-100 h-full">
                    <p className="font-bold">Image Preview Error</p>
                    <p>Image not found</p>
                    <code>{media?.url}</code>
                </div>
            ) : (
                <img
                    src={media?.url}
                    alt={media?.description}
                    className="w-full h-full object-contain"
                    onError={() => setImageNotFound(true)}
                />
            )}
        </div>
    );
};

export const StlPreview: FC<{ media_id: number }> = ({ media_id }) => {
    const { data: media } = useMedia(media_id);

    return (
        <ErrorBoundary>
            <Suspense fallback={<div>Loading...</div>}>
                <StlPreviewWindow stlUrl={media?.url} />
            </Suspense>
        </ErrorBoundary>
    );
};
