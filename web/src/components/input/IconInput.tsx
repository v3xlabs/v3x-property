import Fuse from 'fuse.js';
import { useEffect, useMemo, useState } from 'react';
import { FaFontAwesome } from 'react-icons/fa6';
import { FiCornerLeftUp, FiFeather } from 'react-icons/fi';

import { useFaIcons, useFeatherIcons } from '@/api/icons';

import { DynamicIcon } from '../DynamicIcon';
import { FieldOption } from '../form/Select';
import { FieldSelect } from '../form/Select';

function isDefined<T>(value: T | null | undefined): value is NonNullable<T> {
    return value !== null && value !== undefined;
}

export const IconInput = ({
    value,
    onChange,
    errorMessage,
}: {
    value: string;
    onChange: (_value: string) => void;
    errorMessage?: string;
}) => {
    const [search, setSearch] = useState<string>(value);
    const [category, setCategory] = useState<string | null>();

    // TODO: add {enabled: false} to the Fa and Feather icons to prevent queries from loading until icon interacted
    const { data: iconData } = useFaIcons();
    const { data: featherIcons } = useFeatherIcons();

    const iconDataOptions = useMemo((): FieldOption[] => {
        return [
            {
                label: 'Back',
                value: 'back',
                icon: () => <FiCornerLeftUp />,
                back: true,
            },
            ...([
                ['', 'feather'].includes(category || '')
                    ? {
                          type: 'feather',
                          value: { feather: featherIcons?.svgs },
                      }
                    : undefined,
                ['', 'fa6'].includes(category || '')
                    ? { type: 'fa6', value: iconData?.svgs }
                    : undefined,
            ]
                .filter(isDefined)
                .flatMap(({ type, value }) =>
                    Object.entries(value ?? {}).flatMap(([category, data]) => {
                        return data?.icons?.map(
                            (icon) =>
                                ({
                                    label: `${category}/${icon}`,
                                    value: `${type}:${category}/${icon}`,
                                    icon: () => (
                                        <DynamicIcon
                                            icon={data.url.replace(
                                                '$ITEM',
                                                icon
                                            )}
                                            className="size-4 aspect-square"
                                            key={`${type}:${category}/${icon}`}
                                        />
                                    ),
                                } as FieldOption)
                        );
                    })
                )
                .filter(Boolean) as FieldOption[]),
        ];
    }, [iconData, featherIcons, category]);

    const fuse = useMemo(() => {
        return new Fuse(iconDataOptions, {
            includeScore: true,
            keys: ['value'],
        });
    }, [iconDataOptions]);

    const categoryOptions: FieldOption[] = [
        {
            label: 'Font Awesome 6',
            value: 'fa6',
            icon: () => <FaFontAwesome />,
            group: true,
        },
        {
            label: 'Feather Icons',
            value: 'feather',
            icon: () => <FiFeather />,
            group: true,
        },
    ];

    useEffect(() => {
        setSearch(value);
    }, [value]);

    return (
        <FieldSelect
            label="Icon"
            // name="icon"
            value={value}
            onChange={(value) => {
                if (value == 'fa6') {
                    setCategory('fa6');

                    return false;
                } else if (value == 'feather') {
                    setCategory('feather');

                    return false;
                } else if (value == 'back') {
                    // eslint-disable-next-line unicorn/no-useless-undefined
                    setCategory(undefined);

                    return false;
                }

                onChange(value);

                return true;
            }}
            justifyBetween={true}
            onSearch={setSearch}
            suffix={
                <DynamicIcon
                    icon={value ?? ''}
                    className="size-6 aspect-square my-auto"
                />
            }
            popoverWidth="420"
            errorMessage={errorMessage}
            options={
                search == '' && category == undefined
                    ? categoryOptions
                    : iconDataOptions
            }
            placeholder="feather/box"
            searchFn={(search) => {
                const x = fuse.search(search);

                const r = x
                    .sort((a, b) => (a.score || 0) - (b.score || 0))
                    .filter((result) => result.score ?? 0 > 0.5)
                    .map((result) => result.item);

                // If less then 5 results show custom option
                if (r.length < 5) {
                    r.push({
                        label: 'Custom Icon: "' + search + '"',
                        value: search,
                    });
                }

                return r;
            }}
        />
    );
};
