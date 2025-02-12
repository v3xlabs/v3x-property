import { createFileRoute } from '@tanstack/react-router';

import { useTags } from '@/api';
import { TagCreateModal } from '@/components/tags/TagCreateModal';
import { TagEditModalContent } from '@/components/tags/TagEditModal';
import { Button, Dialog, DialogTrigger, Tag } from '@/gui';

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
            <div className="card space-y-2">
                <ul className="divide-y">
                    {tags?.map((tag) => (
                        <li key={tag.tag_id} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                            <Tag key={tag.tag_id} tag_id={tag.tag_id} />
                            <div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button>
                                            Edit
                                        </Button>
                                    </DialogTrigger>
                                    <TagEditModalContent tag_id={tag.tag_id} />
                                </Dialog>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
