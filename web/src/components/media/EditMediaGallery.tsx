import { FC } from 'react';

import { Button } from '../ui/Button';
import { MediaDropzone } from './MediaDropzone';
import { AttachedMedia } from './upload/t';

export const EditMediaGallery: FC<{ media: AttachedMedia[] }> = ({ media }) => {
    return (
        <div className="card flex-col md:flex-row flex items-stretch gap-2">
            <div className="grow">EditMediaGallery</div>
            <div className="flex flex-col gap-2 md:w-1/3">
                <MediaDropzone />
                <Button>Add Existing</Button>
            </div>
        </div>
    );
};
