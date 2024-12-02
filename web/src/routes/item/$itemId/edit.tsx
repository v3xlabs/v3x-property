import {
    createFileRoute,
    Link,
    useNavigate,
    useParams,
} from '@tanstack/react-router';
import { FC } from 'react';

import { useApiDeleteItem, useApiItemById } from '@/api/item';
import { BaseInput } from '@/components/input/BaseInput';
import { MediaGallery } from '@/components/media/MediaGallery';
import * as AlertDialog from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { SCPage } from '@/layouts/SimpleCenterPage';

export const DeleteItemModal: FC<{ itemId: string }> = ({ itemId }) => {
    const deleteItem = useApiDeleteItem({
        onSuccess() {
            navigate({
                to: '/item/$itemId',
                params: { itemId },
            });
        },
    });
    const navigate = useNavigate();

    return (
        <AlertDialog.Root>
            <AlertDialog.Trigger asChild>
                <button className="btn btn-delete">Delete Item</button>
            </AlertDialog.Trigger>
            <AlertDialog.Content>
                <AlertDialog.Title className="text-red-500">
                    Are you absolutely sure?
                </AlertDialog.Title>
                <AlertDialog.Description>
                    This action cannot be undone. This will permanently delete
                    this item.
                    {deleteItem.error && (
                        <p className="text-red-500">
                            Failed to delete item: {deleteItem.error.message}
                        </p>
                    )}
                </AlertDialog.Description>
                <AlertDialog.Footer>
                    <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                    <AlertDialog.Action
                        variant="destructive"
                        onClick={(event) => {
                            event.preventDefault();
                            deleteItem.mutate(itemId);
                        }}
                        disabled={deleteItem.isPending}
                    >
                        Yes, delete item
                    </AlertDialog.Action>
                </AlertDialog.Footer>
            </AlertDialog.Content>
        </AlertDialog.Root>
    );
};

export const Route = createFileRoute('/item/$itemId/edit')({
    component: () => {
        const { itemId } = useParams({ from: '/item/$itemId/edit' });
        const { data: item } = useApiItemById(itemId);

        return (
            <SCPage title={`Edit Item ${itemId}`}>
                <div className="card space-y-4">
                    <div className="flex flex-col">
                        <MediaGallery
                            media_ids={item?.media ?? []}
                            edit={true}
                        />
                        <div className="px-2 pt-4">
                            <BaseInput
                                label="Item Id"
                                value={item?.item_id}
                                disabled
                            />
                            <BaseInput label="Name" value={item?.name} />
                        </div>
                    </div>
                    <div className="border-2 border-dashed rounded-md p-4 border-red-300 m-2">
                        <h2 className="text-red-500 font-bold">Danger Zone</h2>
                        <p>
                            This action cannot be undone. This will permanently
                            delete this item.
                        </p>
                        <div className="flex justify-end">
                            <DeleteItemModal itemId={itemId} />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button variant="secondary" size="sm" asChild>
                            <Link to="/item/$itemId" params={{ itemId }}>
                                Cancel
                            </Link>
                        </Button>
                        <Button variant="primary" size="sm" asChild>
                            <Link to="/item/$itemId" params={{ itemId }}>
                                Save
                            </Link>
                        </Button>
                    </div>
                </div>
            </SCPage>
        );
    },
});
