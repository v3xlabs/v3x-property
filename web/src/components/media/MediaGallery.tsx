'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { FC } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';

import { BareMediaPreview, MediaPreview } from './MediaPreview';

export const MediaGallery: FC<{
    media_ids: number[];
}> = ({ media_ids }) => {
    return (
        <div className="card flex items-stretch">
            <Dialog.Root modal={true}>
                {media_ids.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 grid-flow-row w-full gap-2">
                        {media_ids.map((media_id) => (
                            <Dialog.Trigger key={media_id}>
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
                    <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Dialog.Content className="w-[80vw] max-w-xl rounded-xl">
                            <BareMediaPreview media_id={media_ids[1]} />
                            <div className="w-full bg-white p-4">
                                <div>
                                    <button className="p-2 bg-neutral-800 text-white">
                                        <FaArrowLeft />
                                    </button>
                                    <button className="p-2 bg-neutral-800 text-white">
                                        <FaArrowRight />
                                    </button>
                                </div>
                            </div>
                        </Dialog.Content>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
};
