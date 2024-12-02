import { FC } from 'react';

import { MediaPreview } from './MediaPreview';

export const MediaGallery: FC<{ media_ids: number[]; edit?: boolean }> = ({
    media_ids,
    edit,
}) => {
    return (
        <div className="card">
            {media_ids.length > 0 ? (
                <div className="flex flex-row items-stretch overflow-x-auto w-full gap-2">
                    {media_ids.map((media_id) => (
                        <MediaPreview
                            media_id={media_id}
                            edit={edit}
                            key={media_id}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center">No media</div>
            )}
        </div>
    );
};
