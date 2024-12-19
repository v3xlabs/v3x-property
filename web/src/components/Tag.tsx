import clsx from 'clsx';
import { FC } from 'react';

import { ApiRequest } from '@/api/core';
import { useTagById } from '@/api/tags';

export type TagT = ApiRequest<'/tags', 'get'>['response']['data'][number];

export const Tag: FC<{ tag?: TagT, tag_id?: number, variant?: 'compact' | 'normal' }> = ({ tag, tag_id, variant = 'normal' }) => {
    const { data: tagDynamicData } = useTagById(tag_id);
    const tagData = tag ?? tagDynamicData;

    return <div className={clsx('text-nowrap rounded-md bg-gray-100', variant === 'compact' ? 'px-1 py-0.5 text-xs' : 'px-2 py-1')}>{tagData?.name}</div>;
};
