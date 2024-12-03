import { FC, useCallback, useEffect, useReducer } from 'react';

import { Button } from '../ui/Button';
import { MediaDropzone } from './MediaDropzone';
import { MediaPreview } from './MediaPreview';
import { AttachedMedia } from './upload/t';

export const EditMediaGallery: FC<{
    media: AttachedMedia[];
    onChange: (_media: AttachedMedia[]) => void;
}> = ({ media, onChange }) => {
    // use reducer to manage media
    const [state, dispatch] = useReducer(
        (
            state: AttachedMedia[],
            action:
                | { type: 'add'; media: AttachedMedia[] }
                | { type: 'update'; blob: string; media: AttachedMedia }
        ) => {
            switch (action.type) {
                case 'add':
                    return [...state, ...action.media];
                case 'update':
                    return state.map((m) =>
                        m.status === 'new-media' && m.blob === action.blob
                            ? action.media
                            : m
                    );
            }
        },
        [media],
        ([media]) => media
    );

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            dispatch({
                type: 'add',
                media: acceptedFiles.map(
                    (file) =>
                        ({
                            status: 'new-media',
                            media_id: undefined,
                            name: file.name,
                            kind: file.type,
                            blob: URL.createObjectURL(file),
                        } as AttachedMedia)
                ),
            });
        },
        [dispatch]
    );

    useEffect(() => {
        onChange(state);
    }, [state]);

    return (
        <div className="card flex-col md:flex-row flex items-stretch gap-2">
            <div className="grow">
                <ul className="grid grid-cols-2 gap-2">
                    {state.map((item, index) => (
                        <li key={index}>
                            {item.status === 'new-media' ? (
                                <MediaPreview
                                    media_id={item.media_id}
                                    url={item.blob}
                                    name={item.name}
                                    kind={item.kind}
                                    update_media_id={(media_id) => {
                                        console.log(
                                            'update_media_id',
                                            media_id
                                        );

                                        dispatch({
                                            type: 'update',
                                            blob: item.blob!,
                                            media: { ...item, media_id },
                                        });
                                    }}
                                />
                            ) : (
                                `Existing media ID: ${item.media_id}`
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col gap-2 md:w-1/3">
                <MediaDropzone onDrop={onDrop} />
                <Button>Add Existing</Button>
            </div>
        </div>
    );
};
