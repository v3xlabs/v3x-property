import { FC } from 'react';
import { match } from 'ts-pattern';

import { useMedia } from '../../api/media';
import { StlPreview } from '../stl_preview/StlPreview';

export const MediaPreview: FC<{ media_id: number }> = ({ media_id }) => {
    const { data: media } = useMedia(media_id);

    const fileType = media?.url.split('.').pop();

    return (
        <div className="aspect-video bg-neutral-100 max-w-md w-full border border-neutral-200 rounded-md">
            {match(fileType)
                .with('webp', () => <ImagePreview media_id={media_id} />)
                .with('stl', () => <StlPreview stlUrl={media?.url} />)
                .otherwise(() => (
                    <div className="p-3">
                        <span>Unknown file type</span>
                        <span>{fileType}</span>
                    </div>
                ))}
        </div>
    );
};

export const ImagePreview: FC<{ media_id: number }> = ({ media_id }) => {
    const { data: media } = useMedia(media_id);

    return (
        <div className="w-full h-full">
            <img
                src={media?.url}
                alt={media?.description}
                className="w-full h-full object-contain"
            />
        </div>
    );
};
