import { createFileRoute } from '@tanstack/react-router';

import { useTags } from '@/api/tags';
import { Tag } from '@/components/Tag';
import { TagCreateModal } from '@/components/tags/TagCreateModal';

export const Route = createFileRoute('/settings/_layout/tags')({
    component: RouteComponent,
    context(context) {
        return {
            title: 'Tags',
            suffix: <TagCreateModal />,
        };
    },
});

function RouteComponent() {
    const { data: tags } = useTags();

    return (
        <>
            <div className="card">All tags show up below here.</div>
            <div className="card flex flex-wrap gap-2">
                {tags?.map((tag) => (
                    <Tag key={tag.tag_id} tag_id={tag.tag_id} />
                ))}
            </div>
        </>
    );
}
