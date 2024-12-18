import { useForm } from '@tanstack/react-form';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import { FaTrash } from 'react-icons/fa6';
import { toast } from 'sonner';
import { match } from 'ts-pattern';

import {
    FieldDefinition,
    getFieldDefinitions,
    useCreateFieldDefinition,
    useEditFieldDefinition,
} from '@/api/fields';
import { DynamicIcon } from '@/components/DynamicIcon';
import { FieldSelect } from '@/components/form/Select';
import { BaseInput } from '@/components/input/BaseInput';
import { IconInput } from '@/components/input/IconInput';
import { Button } from '@/components/ui/Button';
import * as Dialog from '@/components/ui/Dialog';
import { queryClient } from '@/util/query';

const NewFieldDefinitionEditor = ({
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
            className="space-y-2 flex"
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
            className="space-y-2 flex"
        >
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
                        value={field.state.value}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        width="full"
                        errorMessage={field.state.meta.errors.join(', ')}
                    />
                )}
            </form.Field>

            <form.Field name="description">
                {(field) => (
                    <BaseInput
                        label="Description"
                        name="description"
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
                    <div className="flex flex-col gap-2 w-full">
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
                    <div className="flex gap-2 items-center justify-end">
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

    // const fields = [{ definition_id: 'hello' }];

    const columnHelper = createColumnHelper<FieldDefinition>();

    const table = useReactTable({
        columns: [
            columnHelper.accessor('icon', {
                header: 'Icon',
            }),
            columnHelper.accessor('definition_id', {
                header: 'Definition ID',
            }),
            columnHelper.accessor('name', {
                header: 'Name',
            }),
        ],
        data,
        getCoreRowModel: getCoreRowModel(),
    });

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
                <table>
                    <thead>
                        {table.getHeaderGroups().map((header) => (
                            <tr key={header.id}>
                                {header.headers.map((header) => (
                                    <th key={header.id}>
                                        {header.isPlaceholder
                                            ? undefined
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => {
                                    // const item =
                                    //     cell.getValue() as any as FieldDefinition[keyof FieldDefinition];
                                    // const field_id =
                                    //     cell.row.getValue('field_id');

                                    return (
                                        <td key={cell.id}>
                                            {match({
                                                type: cell.column.columnDef[
                                                    'accessorKey'
                                                ],
                                            })
                                                .with({ type: 'icon' }, () => (
                                                    <IconInput
                                                        label={''}
                                                        value={
                                                            cell.getValue()[
                                                                'icon'
                                                            ] ?? ''
                                                            // field.state.value || ''
                                                        }
                                                        // onChange={
                                                        //     field.handleChange
                                                        // }
                                                        // errorMessage={field.state.meta.errors.join(
                                                        //     ', '
                                                        // )}
                                                    />
                                                ))
                                                .with(
                                                    { type: 'name' },
                                                    ({ type }) => (
                                                        // <form.Field
                                                        //     name="definition_id"
                                                        //     validators={{
                                                        //         onChange: ({
                                                        //             value,
                                                        //         }) => {
                                                        //             if (!value) {
                                                        //                 return 'Definition ID is required';
                                                        //             }
                                                        //         },
                                                        //     }}
                                                        // >
                                                        //     {(field) => (
                                                        <BaseInput
                                                            name="name"
                                                            value={
                                                                cell.getValue()
                                                                // field.state.value
                                                            }
                                                            // onChange={
                                                            //     field.handleChange
                                                            // }
                                                            // onBlur={
                                                            //     field.handleBlur
                                                            // }
                                                            width="full"
                                                            // readOnly={!!fieldDef}
                                                            // errorMessage={field.state.meta.errors.join(
                                                            //     ', '
                                                            // )}
                                                        />
                                                        // )}
                                                        // </form.Field>
                                                    )
                                                )
                                                .otherwise(() => (
                                                    <>
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </>
                                                ))}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
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
                        <div>
                            <FieldDefinitionEditor
                                fieldDef={field}
                                // eslint-disable-next-line unicorn/no-useless-undefined
                            />
                        </div>
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
            <Dialog.Root open={creatingField} onOpenChange={setCreatingField}>
                <Dialog.Trigger>
                    <Button>Create Field Definition</Button>
                </Dialog.Trigger>
                <Dialog.Content>
                    <Dialog.Title>Create Field Definition</Dialog.Title>
                    <NewFieldDefinitionEditor
                        onSuccess={() => {
                            setCreatingField(false);
                        }}
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
