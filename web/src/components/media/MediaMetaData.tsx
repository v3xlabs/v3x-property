import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { FC } from 'react';

import { useMedia } from '@/api/media';

import { BaseInput } from '../input/BaseInput';

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

export const MediaMetaData: FC<{
    mediaId: number;
}> = ({ mediaId }) => {
    const media = useMedia(mediaId).data;

    return (
        <>
            <BaseInput
                label="Type"
                value={media?.kind}
                disabled
            />
            <span>Created: {timeAgo.format(new Date(media?.created_at||''))}</span>
            {media?.updated_at !== media?.created_at && (
                <span>Updated: {timeAgo.format(new Date(media?.updated_at||''))}</span>
            )}
        </>
    );
};
