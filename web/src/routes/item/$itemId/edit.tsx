import * as AlertDialog from '@radix-ui/react-alert-dialog';
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
import { SCPage } from '@/layouts/SimpleCenterPage';

export const DeleteItemModal: FC<{ itemId: string }> = ({ itemId }) => {
    const { mutate: deleteItem } = useApiDeleteItem();
    const navigate = useNavigate();

    return (
        <AlertDialog.Root>
            <AlertDialog.Trigger asChild>
                <button className="btn btn-delete">Delete Item</button>
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
                <AlertDialog.Overlay className="bg-black/5 backdrop-blur-sm fixed inset-0" />
                <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[500px] bg-white focus:outline-none card space-y-2">
                    <AlertDialog.Title className="m-0 text-red-500 text-lg">
                        Are you absolutely sure?
                    </AlertDialog.Title>
                    <AlertDialog.Description className="mb-6">
                        This action cannot be undone. This will permanently
                        delete this item.
                    </AlertDialog.Description>
                    <div className="gap-4 flex justify-end">
                        <AlertDialog.Cancel asChild>
                            <button className="btn">Cancel</button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action asChild>
                            <button
                                className="btn btn-delete"
                                onClick={async () => {
                                    await deleteItem(itemId);
                                    navigate({
                                        to: '/item/$itemId',
                                        params: { itemId },
                                    });
                                }}
                            >
                                Yes, delete item
                            </button>
                        </AlertDialog.Action>
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Portal>
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
                        <Link
                            to="/item/$itemId"
                            params={{ itemId }}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </Link>
                        <Link
                            to="/item/$itemId"
                            params={{ itemId }}
                            className="btn btn-primary"
                        >
                            Save
                        </Link>
                    </div>
                </div>
            </SCPage>
        );
    },
});
