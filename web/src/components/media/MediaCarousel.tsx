import '../../embla.css';

import AutoHeight from 'embla-carousel-auto-height';
import useEmblaCarousel from 'embla-carousel-react';
import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';

import { MediaMetaData } from './MediaMetaData';
import { BareMediaPreview } from './MediaPreview';

export const MediaCarousel: FC<{
    ids: number[];
    mediaId: number;
    setMediaId: Dispatch<SetStateAction<number | undefined>>;
}> = ({ ids, mediaId, setMediaId }) => {
    const [emblaReference, emblaApi] = useEmblaCarousel(
        {
            loop: true,
        },
        [AutoHeight()]
    );

    // update mediaId based on embla state
    emblaApi?.on('select', () => {
        const selected = emblaApi.selectedScrollSnap();

        if (selected !== undefined) {
            setMediaId(ids[selected]);
        }
    });

    useEffect(() => {
        if (mediaId !== undefined) {
            const index = ids.indexOf(mediaId);

            // TODO: If this useEffect wasn't triggered by emblaApi.on('select'), then we should set the scrollTo(index, true) boolean to true to not animate the scroll
            emblaApi?.scrollTo(index);
        }
    });

    return (
        <div className="flex flex-col md:flex-row">
            <div ref={emblaReference} className="embla overflow-hidden">
                <div className="embla__container">
                    {ids.map((id) => (
                        <div
                            key={id}
                            className="embla__slide rounded-lg select-none"
                            draggable={false}
                        >
                            <BareMediaPreview media_id={id} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-4 min-w-64">
                <code>
                    <MediaMetaData mediaId={mediaId} />
                </code>
                <div>
                    <button
                        className="bg-gray-200 rounded-lg p-2 disabled:opacity-50 text-black px-2 gap-x-2"
                        onClick={() => {
                            emblaApi?.scrollPrev();
                        }}
                    >
                        <FaArrowLeft />
                    </button>
                    <button
                        className="bg-gray-200 rounded-lg p-2 disabled:opacity-50 text-black px-2 gap-x-2"
                        onClick={() => {
                            emblaApi?.scrollNext();
                        }}
                    >
                        <FaArrowRight />
                    </button>
                </div>
            </div>
        </div>
    );
};
