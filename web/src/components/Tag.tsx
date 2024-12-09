import { ApiRequest } from '@/api/core';

export type TagT = ApiRequest<'/tags', 'get'>['response']['data'][number];

export const Tag = ({ tag }: { tag: TagT }) => {
    return <div className="rounded-md bg-gray-100 px-2 py-1">{tag.name}</div>;
};
