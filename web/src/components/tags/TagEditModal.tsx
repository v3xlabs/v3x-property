import { useForm } from '@tanstack/react-form';
import { FC } from 'react';

import { useTagById, useTagEdit } from '@/api/tags';

import { BaseInput } from '../input/BaseInput';
import { Button } from '../ui/Button';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/Dialog';

export const TagEditModalContent: FC<{ tag_id?: number }> = ({ tag_id }) => {
    const { data: tag } = useTagById(tag_id);
    const { mutateAsync: editTag } = useTagEdit();
    const { Field, Subscribe, handleSubmit } = useForm({
        defaultValues: {
            name: tag?.name ?? '',
            color: tag?.color ?? '',
        },
        onSubmit: async (values) => {
            console.log(values);
            const tag = await editTag({
                tag_id: tag_id ?? 0,
                name: values.value.name,
                color: values.value.color,
            });

            // TODO: close modal
            alert('TODO: you may close the modal now. auto modal close is not implemented yet.');
        },
    });

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Tag</DialogTitle>
            </DialogHeader>
            <DialogDescription>
                Tags are used to categorize items.
            </DialogDescription>
            <form onSubmit={(event) => {
                event.preventDefault();
                handleSubmit();
            }}>
                <div className="space-y-4">
                    <Field name="name"
                        validators={{
                            onChange: ({ value }) => {
                                if (value.length < 3) {
                                    return 'Name must be at least 3 characters';
                                }
                            },
                        }}
                    >
                        {({ handleChange, state }) => <BaseInput
                            name="name"
                            label="Name"
                            placeholder="Cables"
                            value={state.value}
                            onChange={handleChange}
                            errorMessage={state.meta.errors.join(', ')}
                            required
                        />}
                    </Field>
                    <Field name="color">
                        {({ handleChange, state }) => <BaseInput
                            name="color"
                            label="Color"
                            placeholder="#000000"
                            value={state.value}
                            onChange={handleChange}
                            type="color"
                            errorMessage={state.meta.errors.join(', ')}
                        />}
                    </Field>
                </div>
                <DialogFooter>
                    <Subscribe>
                        {({ isValid }) => (
                            <Button type="submit" disabled={!isValid}>Update</Button>
                        )}
                    </Subscribe>
                </DialogFooter>
            </form>
        </DialogContent>
    );
};
