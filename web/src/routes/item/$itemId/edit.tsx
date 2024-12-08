import { useForm } from '@tanstack/react-form';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
    createFileRoute,
    Link,
    redirect,
    useNavigate,
    useParams,
} from '@tanstack/react-router';
import { FC } from 'react';
import { toast } from 'sonner';

import {
    formatId,
    getInstanceSettings,
} from '@/api/instance_settings';
import {
    getItemById,
    getItemMedia,
    useDeleteItem,
    useEditItem,
} from '@/api/item';
import { BaseInput } from '@/components/input/BaseInput';
import { EditMediaGallery } from '@/components/media/EditMediaGallery';
import { EditItemForm } from '@/components/media/upload/t';
import * as AlertDialog from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { SCPage } from '@/layouts/SimpleCenterPage';
import { queryClient } from '@/util/query';

export const DeleteItemModal: FC<{ itemId: string }> = ({ itemId }) => {
    const deleteItem = useDeleteItem({
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
                <Button variant="destructive">Delete Item</Button>
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
    // if item_id is not formatId(item_id, instanceSettings), redirect to the formatted item_id
    loader: async ({ params }) => {
        // Ensure instance settings are loaded
        const instanceSettings = await queryClient.ensureQueryData(
            getInstanceSettings
        );

        const formattedItemId = formatId(params.itemId, instanceSettings);

        // Redirect if the item_id is not formatted
        if (formattedItemId !== params.itemId) {
            console.log('redirecting to', formattedItemId);

            return redirect({ to: `/item/${formattedItemId}` });
        }

        // Preload item and media
        return Promise.all([
            queryClient.ensureQueryData(getItemById(params.itemId)),
            queryClient.ensureQueryData(getItemMedia(params.itemId)),
        ]);
    },
    component: () => {
        const { itemId } = useParams({ from: '/item/$itemId/edit' });
        const { data: item, refetch } = useSuspenseQuery(getItemById(itemId));
        const { data: media } = useSuspenseQuery(getItemMedia(itemId));
        const { mutateAsync: editItem } = useEditItem();
        const navigate = useNavigate();

        const { Field, Subscribe, handleSubmit } = useForm<EditItemForm>({
            defaultValues: {
                name: item.name ?? '',
                media:
                    media?.map((media_id) => ({
                        status: 'existing-media',
                        media_id,
                    })) ?? [],
            },
            onSubmit: async ({ value }) => {
                console.log('FORM SUBMIT', value);
                const toastId = `item-edit-${itemId}`;

                toast.loading('Saving item...', {
                    id: toastId,
                });

                await editItem(
                    {
                        item_id: itemId,
                        data: {
                            name: value.name,
                            media: value.media
                                .filter((m) => m.media_id !== undefined)
                                .map((m) => ({
                                    status: m.status,
                                    media_id: m.media_id!,
                                })),
                        },
                    },
                    {
                        onSuccess: async (data, variables, context) => {
                            toast.success('Item saved', {
                                id: toastId,
                            });
                            await refetch();
                            navigate({
                                to: '/item/$itemId',
                                params: { itemId },
                            });
                        },
                        onError(error, variables, context) {
                            toast.error('Failed to save item', {
                                description: error.message,
                                id: toastId,
                            });
                        },
                    }
                );
            },
        });

        return (
            <SCPage title={`Edit Item ${itemId}`}>
                <form
                    className="card space-y-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleSubmit();
                    }}
                >
                    <div className="flex flex-col">
                        <Field
                            name="media"
                            validators={{
                                onChange: ({ value }) => {
                                    return value.every((m) => m.media_id)
                                        ? undefined
                                        : 'Not all items have finished uploading';
                                },
                            }}
                            children={({ handleChange, state: { value } }) => (
                                <EditMediaGallery
                                    media={value}
                                    onChange={handleChange}
                                />
                            )}
                        />
                        <div className="px-2 pt-4 space-y-2">
                            <BaseInput
                                label="Item Id"
                                value={item.item_id}
                                disabled
                            />
                            <Field
                                name="name"
                                validators={{
                                    onChange: ({ value }) => {
                                        // console.log('onChange', value);
                                        return (value ?? '').length > 0
                                            ? undefined
                                            : 'Name must be at least 1 character';
                                    },
                                }}
                            >
                                {({
                                    form: {
                                        state: {
                                            values: { name },
                                        },
                                    },
                                    handleChange,
                                    handleBlur,
                                }) => (
                                    <BaseInput
                                        label="Name"
                                        name="name"
                                        value={name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                )}
                            </Field>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button variant="secondary" size="sm" asChild>
                            <Link to="/item/$itemId" params={{ itemId }}>
                                Cancel
                            </Link>
                        </Button>
                        <Subscribe>
                            {({ canSubmit }) => (
                                <Button
                                    variant="primary"
                                    disabled={!canSubmit}
                                    type="submit"
                                >
                                    Save
                                </Button>
                            )}
                        </Subscribe>
                    </div>
                </form>
                <div className="border-2 border-dashed rounded-md p-4 border-red-300 mt-8">
                    <h2 className="text-red-500 font-bold">Danger Zone</h2>
                    <p>
                        This action cannot be undone. This will permanently
                        delete this item.
                    </p>
                    <div className="flex justify-end">
                        <DeleteItemModal itemId={itemId} />
                    </div>
                </div>
            </SCPage>
        );
    },
});
