import { FC } from 'react';

import { MediaPreview } from './MediaPreview';

export const MediaGallery: FC<{
    media_ids: number[];
}> = ({ media_ids }) => {
    return (
        <div className="card flex items-stretch">
            {media_ids.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 grid-flow-row w-full gap-2">
                    {media_ids.map((media_id) => (
                        <MediaPreview media_id={media_id} key={media_id} />
                    ))}
                </div>
            ) : (
                <div className="text-center w-full h-full flex justify-center items-center">
                    No media
                </div>
            )}
        </div>
    );
};
