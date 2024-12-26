'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { FC, useState } from 'react';

import { useMedia } from '@/api/media';

import { MediaCarousel } from './MediaCarousel';
import { MediaPreview } from './MediaPreview';

export const MediaGallery: FC<{
    media_ids: number[];
}> = ({ media_ids }) => {
    const [mediaId, setMediaId] = useState<number | undefined>();

    return (
        <div className="card flex items-stretch">
            <Dialog.Root modal={true}>
                {media_ids.length > 0 ? (
                    <div className="grid w-full grid-flow-row grid-cols-1 gap-2 md:grid-cols-2">
                        {media_ids.map((media_id) => (
                            <Dialog.Trigger
                                key={media_id}
                                onClick={() => {
                                    setMediaId(media_id);
                                }}
                            >
                                <MediaPreview
                                    media_id={media_id}
                                    key={media_id}
                                />
                            </Dialog.Trigger>
                        ))}
                    </div>
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-center">
                        No media
                    </div>
                )}
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-10 bg-black bg-opacity-50" />
                    <Dialog.Content className="fixed inset-0 z-10 mx-auto my-8 h-min max-w-6xl rounded-lg bg-white shadow-lg">
                        <Dialog.DialogTitle className="overflow-hidden p-2 text-center text-xl font-medium">
                            {useMedia(mediaId).data?.description}
                        </Dialog.DialogTitle>
                        <MediaCarousel
                            ids={media_ids}
                            mediaId={mediaId!}
                            setMediaId={setMediaId}
                        />
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
};
