import { FC } from 'react';

import { MediaPreview } from './MediaPreview';

export const MediaGallery: FC<{ media_ids: number[] }> = ({ media_ids }) => {
    return (
        <div className="p-4 w-full">
            <div className="flex flex-row items-stretch overflow-x-auto w-full gap-2">
                {media_ids.map((media_id) => (
                    <MediaPreview media_id={media_id} />
                ))}
            </div>
        </div>
    );
};
