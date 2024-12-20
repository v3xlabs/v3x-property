import { FC } from 'react';

import { MediaPreview } from './MediaPreview';

export const MediaGallery: FC<{
    media_ids: number[];
}> = ({ media_ids }) => {
    return (
        <div className="card flex items-stretch">
            {media_ids.length > 0 ? (
                <div className="grid w-full grid-flow-row grid-cols-1 gap-2 md:grid-cols-2">
                    {media_ids.map((media_id) => (
                        <MediaPreview media_id={media_id} key={media_id} />
                    ))}
                </div>
            ) : (
                <div className="flex h-full w-full items-center justify-center text-center">
                    No media
                </div>
            )}
        </div>
    );
};
