import { useForm } from '@tanstack/react-form';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { FaPencil, FaTrash } from 'react-icons/fa6';
import { toast } from 'sonner';

import {
    FieldDefinition,
    getFieldDefinitions,
    useCreateFieldDefinition,
    useEditFieldDefinition,
} from '@/api';
import { BaseInput, Button, Dialog, DynamicIcon, FieldSelect, IconInput } from '@/gui';
import { queryClient } from '@/util/query';

const FieldDefinitionEditor = ({
    fieldDef,
    onSuccess,
}: {
    fieldDef?: FieldDefinition;
    onSuccess?: () => void;
}) => {
    const createMutation = useCreateFieldDefinition();
    const updateMutation = useEditFieldDefinition();

    const [previewIcon, setPreviewIcon] = useState<string | undefined>(
        fieldDef?.icon
    );

    const form = useForm<FieldDefinition>({
        defaultValues: fieldDef ?? {
            definition_id: '',
            kind: 'String', // Default kind
            name: '',
            description: '',
            placeholder: '',
            icon: '',
        },
        onSubmit: async ({ value }) => {
            try {
                await (fieldDef?.definition_id
                    ? updateMutation.mutateAsync({
                        field_id: fieldDef.definition_id,
                        data: value,
                    })
                    : createMutation.mutateAsync(value));
                onSuccess?.();
            } catch (error) {
                console.error('Failed to save field definition:', error);
            }
        },
    });

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                form.handleSubmit();
            }}
            className="space-y-2"
        >
            <form.Field
                name="definition_id"
                validators={{
                    onChange: ({ value }) => {
                        if (!value) {
                            return 'Definition ID is required';
                        }
                    },
                }}
            >
                {(field) => (
                    <BaseInput
                        label="Definition ID"
                        name="definition_id"
                        placeholder="battery_capacity"
                        value={field.state.value}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        width="full"
                        readOnly={!!fieldDef}
                        errorMessage={field.state.meta.errors.join(', ')}
                        required
                    />
                )}
            </form.Field>
            <form.Field
                name="name"
                validators={{
                    onChange: ({ value }) => {
                        if (!value) {
                            return 'Name is required';
                        }
                    },
                }}
            >
                {(field) => (
                    <BaseInput
                        label="Name"
                        name="name"
                        placeholder="Battery Capacity"
                        value={field.state.value}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        width="full"
                        errorMessage={field.state.meta.errors.join(', ')}
                        required
                    />
                )}
            </form.Field>

            <form.Field name="description">
                {(field) => (
                    <BaseInput
                        label="Description"
                        name="description"
                        placeholder="The capacity of the battery in mAh"
                        value={field.state.value}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        width="full"
                        errorMessage={field.state.meta.errors.join(', ')}
                    />
                )}
            </form.Field>

            <form.Field name="placeholder">
                {(field) => (
                    <BaseInput
                        label="Placeholder"
                        name="placeholder"
                        placeholder="Capacity (ex 500mAh)"
                        value={field.state.value}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        width="full"
                        errorMessage={field.state.meta.errors.join(', ')}
                    />
                )}
            </form.Field>

            <form.Field
                name="kind"
                validators={{
                    onChange: ({ value }) => {
                        if (!value) {
                            return 'Kind is required';
                        }

                        if (
                            !['String', 'Number', 'Boolean', 'Json'].includes(
                                value
                            )
                        ) {
                            return 'Invalid kind';
                        }
                    },
                }}
            >
                {(field) => (
                    <div className="flex w-full flex-col gap-2">
                        <FieldSelect
                            label="Kind"
                            value={field.state.value}
                            onChange={(value) =>
                                field.handleChange(
                                    value as
                                    | 'String'
                                    | 'Number'
                                    | 'Boolean'
                                    | 'Json'
                                )
                            }
                            options={[
                                { label: 'String', value: 'String' },
                                { label: 'Number', value: 'Number' },
                                { label: 'Boolean', value: 'Boolean' },
                                { label: 'Json', value: 'Json' },
                            ]}
                        />
                    </div>
                )}
            </form.Field>

            <form.Field
                name="icon"
                validators={{
                    onChange: ({ value }) => {
                        setPreviewIcon(value);

                        // eslint-disable-next-line unicorn/no-useless-undefined
                        return undefined;
                    },
                }}
            >
                {(field) => (
                    <IconInput
                        value={field.state.value || ''}
                        onChange={field.handleChange}
                        errorMessage={field.state.meta.errors.join(', ')}
                    />
                )}
            </form.Field>

            <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            type="submit"
                            disabled={!canSubmit || isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                )}
            />
        </form>
    );
};

const RouteComponent = () => {
    const { data } = useSuspenseQuery(getFieldDefinitions());

    const [editingField, setEditingField] = useState<
        FieldDefinition | undefined
    >();

    const [creatingField, setCreatingField] = useState<boolean>(false);

    return (
        // suffix={
        //     <Dialog.Root
        //         open={creatingField}
        //         onOpenChange={setCreatingField}
        //     >
        //         <Dialog.Trigger>
        //             <Button>Create Field Definition</Button>
        //         </Dialog.Trigger>
        //         <Dialog.Content>
        //             <Dialog.Title>Create Field Definition</Dialog.Title>
        //             <FieldDefinitionEditor
        //                 onSuccess={() => {
        //                     setCreatingField(false);
        //                 }}
        //             />
        //         </Dialog.Content>
        //     </Dialog.Root>
        // }
        <>
            <div className="card">
                {data.map((field) => (
                    <div
                        className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-50"
                        key={field.definition_id}
                    >
                        {field.icon && (
                            <DynamicIcon
                                icon={field.icon}
                                className="aspect-square size-4"
                            />
                        )}
                        {field.name}
                        <Button
                            onClick={() => setEditingField(field)}
                            variant="ghost"
                            className="ml-auto"
                        >
                            <FaPencil />
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                toast.error('Not implemented');
                            }}
                            className="aspect-square"
                        >
                            <FaTrash />
                        </Button>
                    </div>
                ))}
            </div>

            <Dialog.Root
                open={!!editingField}
                onOpenChange={(open) => {
                    if (!open) {
                        // eslint-disable-next-line unicorn/no-useless-undefined
                        setEditingField(undefined);
                    }
                }}
            >
                <Dialog.Content>
                    <Dialog.Title>Edit Field Definition</Dialog.Title>
                    <FieldDefinitionEditor
                        fieldDef={editingField!}
                        // eslint-disable-next-line unicorn/no-useless-undefined
                        onSuccess={() => setEditingField(undefined)}
                    />
                </Dialog.Content>
            </Dialog.Root>
        </>
    );
};

export const Route = createFileRoute('/settings/_layout/fields/')({
    loader: async () => {
        queryClient.prefetchQuery(getFieldDefinitions());
    },
    context() {
        return {
            title: 'Field Definitions',
            suffix: <div>TODO: Create</div>,
        };
    },
    component: RouteComponent,
});
