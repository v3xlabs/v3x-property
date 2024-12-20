import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import { FC } from 'react';

import { ApiRequest } from '@/api/core';
import { useTagById } from '@/api/tags';

export type TagT = ApiRequest<'/tags', 'get'>['response']['data'][number];

const colorIsDark = (color: string) => {
    if (!color) return false;

    const [r, g, b] = color.match(/\w\w/g)!.map(x => Number.parseInt(x, 16));

    return (r * 0.299 + g * 0.587 + b * 0.114) < 186;
};

// text color generator (generate white or black-ish), make this color inspired by the color of the tag
const textColorGenerator = (color: string) => {
    if (!color) return 'rgba(0, 0, 0, 0.8)';

    const isDark = colorIsDark(color);
    const [r, g, b] = color.match(/\w\w/g)!.map(x => Number.parseInt(x, 16));

    return isDark ? 'rgba(255, 255, 255, 0.9)' : `rgba(${r * 0.3}, ${g * 0.3}, ${b * 0.3}, 0.95)`;
};

export const Tag: FC<{ tag?: TagT, tag_id?: number, variant?: 'compact' | 'normal' }> = ({ tag, tag_id, variant = 'normal' }) => {
    const { data: tagDynamicData } = useTagById(tag_id);
    const tagData = tag ?? tagDynamicData;

    return <Link
        to="/tag/$tagId"
        params={{ tagId: (tagData?.tag_id ?? '').toString() }}
        className={clsx(
            'text-nowrap rounded-md',
            variant === 'compact' ? 'px-1 py-0.5 text-xs' : 'px-2 py-1',
            tagData?.color ? '' : 'bg-gray-100 hover:bg-gray-200',
        )}
        style={{ backgroundColor: tagData?.color, color: textColorGenerator(tagData?.color ?? '') }}
    >
        {tagData?.name}
    </Link>;
};
