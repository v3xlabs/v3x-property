import { FC } from 'react';

import { MediaPreview } from './MediaPreview';

export const MediaGallery: FC<{ media_ids: number[] }> = ({ media_ids }) => {
    return (
        <div className="p-4">
            <div className="flex items-stretch gap-2">
                {media_ids.map((media_id) => (
                    <MediaPreview media_id={media_id} />
                ))}
            </div>
        </div>
    );
};
