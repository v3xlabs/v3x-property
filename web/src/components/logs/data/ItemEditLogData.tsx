import { FC, useMemo } from 'react';
import { match } from 'ts-pattern';
import { z } from 'zod';

import { useFieldDefinitions } from '@/api/fields';
import { MediaPreview } from '@/components/media/MediaPreview';

import { ApiLogEntry } from '../ItemLogEntry';

const FieldInfo = ({
    definition_id,
    value,
    removed,
}: {
    definition_id: string;
    value?: string;
    removed?: string;
}) => {
    const { data: fieldDefinitions } = useFieldDefinitions();

    const fieldDefinition = fieldDefinitions?.find(
        (field) => field.definition_id === definition_id
    );

    return (
        <div className={removed ? 'text-red-500' : ''}>
            <div className="font-bold">
                {fieldDefinition?.name ?? definition_id}
            </div>
            <div>{value}</div>
        </div>
    );
};

export const ItemEditLogData: FC<{ log: ApiLogEntry }> = ({ log }) => {
    const log_data = useMemo(() => {
        try {
            return JSON.parse(log.data);
        } catch {
            return log.data;
        }
    }, [log.data]);

    return (
        <div className="card no-padding p-2 w-full">
            <ul className="space-y-2">
                {Object.entries(log_data)
                    .filter(
                        ([_, b]) =>
                            (Array.isArray(b) && b.length > 0) ||
                            (!Array.isArray(b) && b != undefined)
                    )
                    .map(([key, value]) => (
                        <li key={key} className="space-x-2 space-y-1">
                            <span className="font-bold px-2">
                                {match(key)
                                    .with('media', () => 'Changed Media')
                                    .with('fields', () => 'Changed Fields')
                                    .otherwise(() => key)}
                            </span>
                            {match(key)
                                .with('media', () => {
                                    const mediaSchema = z.array(
                                        z.object({
                                            status: z.enum([
                                                'new-media',
                                                'removed-media',
                                                'existing-media',
                                            ]),
                                            media_id: z.number(),
                                        })
                                    );

                                    const media = mediaSchema.safeParse(value);

                                    if (!media.success) {
                                        return (
                                            <span>
                                                <span>
                                                    {JSON.stringify(value)}
                                                </span>
                                                <span>
                                                    Failed to parse media
                                                    changes
                                                </span>
                                            </span>
                                        );
                                    }

                                    return (
                                        <span>
                                            <ul className="flex flex-row flex-wrap gap-2">
                                                {media.data
                                                    .filter(
                                                        (media) =>
                                                            media.status !==
                                                            'existing-media'
                                                    )
                                                    .map(
                                                        ({
                                                            status,
                                                            media_id,
                                                        }) => (
                                                            <div className="card no-padding p-2 max-w-64 space-y-1">
                                                                <div className="px-2">
                                                                    {match(
                                                                        status
                                                                    )
                                                                        .with(
                                                                            'new-media',
                                                                            () =>
                                                                                'New media'
                                                                        )
                                                                        .with(
                                                                            'removed-media',
                                                                            () =>
                                                                                'Removed media'
                                                                        )
                                                                        .otherwise(
                                                                            () =>
                                                                                'Unknown status'
                                                                        )}
                                                                </div>
                                                                <MediaPreview
                                                                    media_id={
                                                                        media_id
                                                                    }
                                                                    variant="small"
                                                                />
                                                            </div>
                                                        )
                                                    )}
                                            </ul>
                                        </span>
                                    );
                                })
                                .with('fields', () => {
                                    const fieldSchema = z.array(
                                        z.object({
                                            definition_id: z.string(),
                                            value: z.string().nullable(),
                                        })
                                    );

                                    const field = fieldSchema.safeParse(value);

                                    if (!field.success) {
                                        return (
                                            <span>
                                                <span>
                                                    {JSON.stringify(value)}
                                                </span>
                                                <span>
                                                    Failed to parse field
                                                    changes
                                                </span>
                                            </span>
                                        );
                                    }

                                    return (
                                        <ul>
                                            {field.data?.map(
                                                ({ definition_id, value }) => (
                                                    <li key={definition_id}>
                                                        <FieldInfo
                                                            definition_id={
                                                                definition_id
                                                            }
                                                            value={value ?? ''}
                                                            removed={
                                                                value ==
                                                                undefined
                                                            }
                                                        />
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    );
                                })
                                .otherwise(() => (
                                    <span>
                                        {value instanceof Object
                                            ? JSON.stringify(value)
                                            : (value as string)}
                                    </span>
                                ))}
                        </li>
                    ))}
            </ul>
        </div>
    );
};
