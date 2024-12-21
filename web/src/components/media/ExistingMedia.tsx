import { FC, useState } from 'react';

import { useAllMedia } from '@/api/media';
import { useUnassignedMedia } from '@/api/media';

import { Button } from '../ui/Button';
import { DialogDescription, DialogFooter, DialogHeader } from '../ui/Dialog';
import { AttachedMedia } from './upload/t';

export const ExistingMedia: FC<{ onChange?: (media_ids: AttachedMedia[]) => void }> = ({ onChange }) => {
    const { data: media } = useUnassignedMedia();
    const { data: allMedia } = useAllMedia();
    const [selectedMedia, setSelectedMedia] = useState<AttachedMedia[]>([]);

    return <>
        <DialogHeader>
            Existing Media
        </DialogHeader>
        <DialogDescription>
            Select the media you want to add to the gallery.
        </DialogDescription>
        <div>
            <div className="text-lg font-bold">Unassigned</div>
            <ul className="max-h-[200px] overflow-y-auto">
                {media?.map(item => {
                    const isSelected = selectedMedia.some(media => media.media_id === item.media_id);

                    return (
                        <li key={item.media_id}>
                            {item.media_id}
                            {item.description}
                            <Button type="button" onClick={() => {
                                if (selectedMedia.some(media => media.media_id === item.media_id)) {
                                    setSelectedMedia(selectedMedia.filter(id => id.media_id !== item.media_id));
                                } else {
                                    setSelectedMedia([...selectedMedia, {
                                        status: 'new-media',
                                        media_id: item.media_id,
                                        kind: item.kind,
                                        name: item.description,
                                    }]);
                                }
                            }}
                            variant={isSelected ? 'primary' : 'secondary'}
                            >
                                {isSelected ? 'Selected' : 'Select'}
                            </Button>
                        </li>
                    );
                })}
            </ul>
            <div className="text-lg font-bold">All</div>
            <ul className="max-h-[200px] overflow-y-auto">
                {allMedia?.map(item => (
                    <li key={item.media_id}>
                        {item.media_id}
                        {item.description}
                    </li>
                ))}
            </ul>
        </div>
        <DialogFooter>
            <Button type="button" onClick={() => onChange?.(selectedMedia)}>Add</Button>
        </DialogFooter>
    </>;
};
