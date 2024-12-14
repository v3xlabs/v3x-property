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
                    <div className="grid grid-cols-1 md:grid-cols-2 grid-flow-row w-full gap-2">
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
                    <div className="text-center w-full h-full flex justify-center items-center">
                        No media
                    </div>
                )}
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
                    <Dialog.Content className="fixed inset-0 bg-white rounded-lg shadow-lg max-w-6xl mx-auto my-8 h-min">
                        <Dialog.DialogTitle className="text-center font-medium text-xl overflow-hidden p-2">
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
