/* eslint-disable sonarjs/no-identical-functions */
import clsx from 'clsx';
import { FC, Reducer, useCallback, useEffect, useReducer } from 'react';

import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogTrigger } from '../ui/Dialog';
import { ExistingMedia } from './ExistingMedia';
import { MediaDropzone } from './MediaDropzone';
import { MediaPreview } from './MediaPreview';
import { AttachedMedia } from './upload/t';

type Action =
    | { type: 'add'; media: AttachedMedia[] }
    | { type: 'update'; blob: string; media: AttachedMedia }
    | { type: 'remove'; media_id: number };

const reducer: Reducer<AttachedMedia[], Action> = (state, action) => {
    switch (action.type) {
        case 'add':
            return [...state, ...action.media];
        case 'update':
            return state.map((m) =>
                m.status === 'new-media' && m.blob === action.blob
                    ? action.media
                    : m
            );
        case 'remove':
            console.log('remove');

            return state
                .map((m) => {
                    if (m.media_id === action.media_id) {
                        // If brand new media, no need to tell engine, just remove it
                        if (m.status === 'new-media') {
                            return;
                        }

                        // Otherwise, tell engine to remove it
                        return {
                            ...m,
                            status: 'removed-media',
                        } as AttachedMedia;
                    }

                    return m;
                })
                .filter((m) => !!m);
        default:
            return state;
    }
};

export const EditMediaGallery: FC<{
    media: AttachedMedia[];
    onChange: (_media: AttachedMedia[]) => void;
}> = ({ media, onChange }) => {
    // use reducer to manage media
    const [state, dispatch] = useReducer(reducer, [media], ([media]) => media);

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
        <div className="card flex flex-col items-stretch gap-2 md:flex-row">
            <div className="grow">
                <ul
                    className={clsx(
                        'grid auto-rows-fr gap-2',
                        state.length > 0 && 'grid-cols-1 md:grid-cols-2'
                    )}
                >
                    {state.map((item, index) => (
                        <li key={index}>
                            {item.status === 'new-media' ? (
                                <MediaPreview
                                    media_id={item.media_id}
                                    url={item.blob}
                                    name={item.name}
                                    kind={item.kind}
                                    status={item.status}
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
                                    delete_media={(media_id) => {
                                        dispatch({
                                            type: 'remove',
                                            media_id,
                                        });
                                    }}
                                />
                            ) : (
                                <MediaPreview
                                    media_id={item.media_id}
                                    status={item.status}
                                    delete_media={(media_id) => {
                                        dispatch({
                                            type: 'remove',
                                            media_id,
                                        });
                                    }}
                                />
                            )}
                        </li>
                    ))}
                    <li className="flex w-full flex-col gap-2">
                        <MediaDropzone onDrop={onDrop} />
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button type="button">Add Existing</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                                <ExistingMedia onChange={(media) => {
                                    dispatch({
                                        type: 'add',
                                        media,
                                    });
                                }} />
                            </DialogContent>
                        </Dialog>
                    </li>
                </ul>
            </div>
        </div>
    );
};
