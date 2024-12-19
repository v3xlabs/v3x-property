import { ApiRequest } from '@/api/core';
import { useTagById } from '@/api/tags';

export type TagT = ApiRequest<'/tags', 'get'>['response']['data'][number];

export const Tag = ({ tag, tag_id }: { tag?: TagT, tag_id?: number }) => {
    const { data: tagDynamicData } = useTagById(tag_id);
    const tagData = tag ?? tagDynamicData;

    return <div className="rounded-md bg-gray-100 px-2 py-1">{tagData?.name}</div>;
};
