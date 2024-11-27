import { FC } from 'react';

export const MediaPreview: FC<{ media_id: number }> = ({ media_id }) => {
    return (
        <div className="aspect-video bg-neutral-100">
            MediaPreview
            {media_id}
        </div>
    );
};
