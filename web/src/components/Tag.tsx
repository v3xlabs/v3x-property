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
            colorIsDark(tagData?.color ?? '') ? 'text-white' : 'text-black'
        )}
        style={{ backgroundColor: tagData?.color }}
    >
        {tagData?.name}
    </Link>;
};
