import { FC } from 'react';

import { useMedia } from '@/api/media';

export const MediaMetaData: FC<{
    mediaId: number;
}> = ({ mediaId }) => {
    const media = useMedia(mediaId).data;

    return (
        <>
            <p>Type: {media?.kind}</p>
            <p>Created: {media?.created_at}</p>
            <p>Updated: {media?.updated_at}</p>
        </>
    );
};
