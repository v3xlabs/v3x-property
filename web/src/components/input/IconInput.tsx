import Fuse from 'fuse.js';
import { useMemo } from 'react';

import { useFaIcons, useFeatherIcons } from '@/api/icons';

import { DynamicIcon } from '../DynamicIcon';
import { FieldOption } from '../form/Select';
import { FieldSelect } from '../form/Select';

export const IconInput = ({
    value,
    onChange,
    errorMessage,
}: {
    value: string;
    onChange: (_value: string) => void;
    errorMessage?: string;
}) => {
    // TODO: add {enabled: false} to the Fa and Feather icons to prevent queries from loading until icon interacted
    const { data: iconData } = useFaIcons();
    const { data: featherIcons } = useFeatherIcons();

    const iconDataOptions = useMemo(() => {
        return [
            { type: 'fa6', value: iconData?.svgs },
            { type: 'feather', value: { feather: featherIcons?.svgs } },
        ]
            .flatMap(({ type, value }) =>
                Object.entries(value ?? {}).flatMap(([category, data]) => {
                    return data?.icons?.map(
                        (icon) =>
                            ({
                                label: `${category}/${icon}`,
                                value: `${type}:${category}/${icon}`,
                                icon: () => (
                                    <DynamicIcon
                                        icon={data.url.replace('$ITEM', icon)}
                                        className="size-4 aspect-square"
                                        key={`${type}:${category}/${icon}`}
                                    />
                                ),
                            } as FieldOption)
                    );
                })
            )
            .filter(Boolean) as FieldOption[];
    }, [iconData, featherIcons]);

    const fuse = useMemo(() => {
        return new Fuse(iconDataOptions, {
            includeScore: true,
            keys: ['value'],
        });
    }, [iconDataOptions]);

    return (
        <FieldSelect
            label="Icon"
            // name="icon"
            value={value}
            onChange={onChange}
            justifyBetween={true}
            suffix={
                <DynamicIcon
                    icon={value ?? ''}
                    className="size-6 aspect-square my-auto"
                />
            }
            popoverWidth="420"
            errorMessage={errorMessage}
            options={iconDataOptions}
            searchFn={(search) => {
                const x = fuse.search(search);

                return x
                    .sort((a, b) => (a.score || 0) - (b.score || 0))
                    .filter((result) => result.score ?? 0 > 0.5)
                    .map((result) => result.item);
            }}
        />
    );
};
