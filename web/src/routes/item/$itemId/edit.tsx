import { useForm } from '@tanstack/react-form';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
    createFileRoute,
    Link,
    redirect,
    useNavigate,
    useParams,
} from '@tanstack/react-router';
import { FC, useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa6';
import { toast } from 'sonner';

import { FieldDefinition, getFieldDefinitions } from '@/api/fields/indes';
import { getItemFields } from '@/api/fields/item';
import { formatId, getInstanceSettings } from '@/api/instance_settings';
import {
    getItemById,
    getItemMedia,
    useDeleteItem,
    useEditItem,
} from '@/api/item';
import { BaseInput } from '@/components/input/BaseInput';
import { ItemIntelligentSuggest } from '@/components/item/ItemIntelligentSuggest';
import { EditMediaGallery } from '@/components/media/EditMediaGallery';
import * as AlertDialog from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import * as Command from '@/components/ui/Command';
import * as Popover from '@/components/ui/Popover';
import { SCPage } from '@/layouts/SimpleCenterPage';
import {
    fromItemToForm,
    isEmptyDiff,
    itemDiff,
    ItemUpdatePayload,
} from '@/util/item';
import { queryClient } from '@/util/query';

const EMPTY_VALUE = '$$EMPTY$$';

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

const AddField = (properties: {
    existingFields: string[];
    onSelect: (field: FieldDefinition) => void;
}) => {
    const { data: fieldsDefinitions } = useSuspenseQuery(getFieldDefinitions());
    const [open, setOpen] = useState(false);

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <Button
                    variant="default"
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    Add Field
                    <FaPlus className="opacity-50" />
                </Button>
            </Popover.Trigger>
            <Popover.Content className="w-[200px] p-0">
                <Command.Root>
                    <Command.Input placeholder="Search fields..." />
                    <Command.List>
                        <Command.Empty>No more fields</Command.Empty>
                        <Command.Group>
                            {fieldsDefinitions
                                ?.filter(
                                    (field) =>
                                        !properties.existingFields.includes(
                                            field.definition_id
                                        )
                                )
                                ?.map((field) => (
                                    <Command.Item
                                        key={field.definition_id}
                                        value={field.definition_id}
                                        onSelect={() => {
                                            properties.onSelect(field);
                                            setOpen(false);
                                        }}
                                    >
                                        {field.name}
                                    </Command.Item>
                                ))}
                        </Command.Group>
                    </Command.List>
                </Command.Root>
            </Popover.Content>
        </Popover.Root>
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
            queryClient.ensureQueryData(getFieldDefinitions()),
            queryClient.ensureQueryData(getItemFields(params.itemId)),
        ]);
    },
    component: () => {
        const { itemId } = useParams({ from: '/item/$itemId/edit' });
        const { data: item } = useSuspenseQuery(getItemById(itemId));
        const { data: media } = useSuspenseQuery(getItemMedia(itemId));
        const { mutateAsync: editItem } = useEditItem();
        const { data: itemFields } = useSuspenseQuery(getItemFields(itemId));
        const navigate = useNavigate();

        const defaultValue = fromItemToForm(
            item,
            itemFields as { definition_id: string; value: string }[],
            media
        );

        const { Field, Subscribe, handleSubmit } = useForm<ItemUpdatePayload>({
            // TODO: Fix this ts-ignore
            // @ts-ignore
            defaultValues: defaultValue,
            validators: {
                onSubmit: ({ value }) => {
                    const isEmpty = isEmptyDiff(itemDiff(value, defaultValue));

                    return isEmpty ? 'No changes made' : undefined;
                },
            },
            onSubmitInvalid: () => {
                toast.error('No changes to save');
            },
            onSubmit: async ({ value }) => {
                console.log('FORM SUBMIT', value);

                const payload = {
                    name: value.name,
                    media: value.media
                        ?.filter((m) => m.media_id !== undefined)
                        .map((m) => ({
                            status: m.status,
                            media_id: m.media_id!,
                        })),
                    fields: value.fields?.map((field) => ({
                        definition_id: field.definition_id,
                        value:
                            field.value === EMPTY_VALUE || field.value === ''
                                ? // eslint-disable-next-line unicorn/no-null
                                null
                                : field.value,
                    })),
                };

                const diff = itemDiff(payload, defaultValue);

                console.log('DIFF', diff);

                const isEmpty = isEmptyDiff(diff);

                if (isEmpty) {
                    toast.error('Really no changes to save');

                    return 'no-changes';
                }

                const toastId = `item-edit-${itemId}`;

                toast.loading('Saving item...', {
                    id: toastId,
                });

                await editItem(
                    {
                        item_id: itemId,
                        data: diff,
                    },
                    {
                        onSuccess: async (data, variables, context) => {
                            toast.success('Item saved', {
                                id: toastId,
                            });
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
                                    return value?.every((m) => m.media_id)
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
                        <div className="px-2 pt-4 space-y-4">
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
                            <hr />
                            <Field name="fields" mode="array">
                                {(field) => (
                                    <>
                                        {field.state.value
                                            .filter(
                                                (itemField) =>
                                                    itemField.value !==
                                                    EMPTY_VALUE
                                            )
                                            .map((value, index) => (
                                                <Field
                                                    key={index}
                                                    name={`fields[${index}].value`}
                                                >
                                                    {(subField) =>
                                                        subField.state.value !==
                                                        EMPTY_VALUE && (
                                                            <BaseInput
                                                                label={
                                                                    value.definition_name
                                                                }
                                                                value={subField.state.value?.toString()}
                                                                onChange={
                                                                    subField.handleChange
                                                                }
                                                                description={
                                                                    value.definition_description
                                                                }
                                                                placeholder={
                                                                    value.definition_placeholder
                                                                }
                                                                suffix={
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        type="button"
                                                                        onClick={() => {
                                                                            subField.handleChange(
                                                                                EMPTY_VALUE
                                                                            );
                                                                        }}
                                                                    >
                                                                        <FaTrash />
                                                                    </Button>
                                                                }
                                                            />
                                                        )
                                                    }
                                                </Field>
                                            ))}
                                        <div className="flex justify-end">
                                            <AddField
                                                existingFields={
                                                    field.state.value
                                                        .filter(
                                                            (itemField) =>
                                                                itemField.value !==
                                                                EMPTY_VALUE
                                                        )
                                                        .map(
                                                            (itemField) =>
                                                                itemField.definition_id
                                                        ) ?? []
                                                }
                                                onSelect={(fieldDefinition) => {
                                                    field.handleChange([
                                                        ...field.state.value.filter(
                                                            (itemField) =>
                                                                itemField.definition_id !==
                                                                fieldDefinition.definition_id
                                                        ),
                                                        {
                                                            definition_id:
                                                                fieldDefinition.definition_id,
                                                            value: '',
                                                            definition_name:
                                                                fieldDefinition.name,
                                                            definition_kind:
                                                                fieldDefinition.kind,
                                                        },
                                                    ]);
                                                }}
                                            />
                                        </div>
                                    </>
                                )}
                            </Field>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <ItemIntelligentSuggest itemId={item.item_id} />
                        <Button variant="secondary" size="sm" asChild>
                            <Link to="/item/$itemId" params={{ itemId }}>
                                Cancel
                            </Link>
                        </Button>
                        <Subscribe
                            selector={(state) => [
                                state.canSubmit,
                                state.isSubmitting,
                            ]}
                            children={([canSubmit, isSubmitting]) => (
                                <Button
                                    variant="primary"
                                    disabled={!canSubmit || isSubmitting}
                                    type="submit"
                                >
                                    Save
                                </Button>
                            )}
                        />
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
