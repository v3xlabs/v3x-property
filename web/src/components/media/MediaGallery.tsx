'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { FC, useState } from 'react';

import { useMedia } from '@/api';

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
                    <div className="grid w-full grid-flow-row grid-cols-1 gap-2 md:grid-cols-1">
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
                    <Dialog.Overlay className="fixed inset-0 z-20 bg-black bg-opacity-50" />
                    <Dialog.Content className="fixed inset-0 z-20 mx-auto mb-8 mt-12 h-min max-w-6xl rounded-lg bg-white shadow-lg">
                        <Dialog.DialogTitle className="overflow-hidden p-2 text-center text-xl font-medium">
                            {useMedia(mediaId).data?.description}
                        </Dialog.DialogTitle>
                        <Dialog.Close className="absolute right-0 top-0 p-2 text-xl text-gray-500 hover:text-gray-700">
                            &times;
                        </Dialog.Close>
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
