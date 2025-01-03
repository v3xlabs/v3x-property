import { useForm } from '@tanstack/react-form';
import { FC } from 'react';

import { useTagCreate } from '@/api';
import { BaseInput,Button , Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger  } from '@/gui';

const TagCreateModalContent: FC<{ name?: string }> = ({ name }) => {
    const { mutateAsync: createTag } = useTagCreate();
    const { Field, Subscribe, handleSubmit } = useForm({
        defaultValues: {
            name: name ?? '',
            color: '',
        },
        onSubmit: async (values) => {
            console.log(values);
            const tag = await createTag({
                tag_id: 0,
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
                <DialogTitle>Create Tag</DialogTitle>
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
                            <Button type="submit" disabled={!isValid}>Create</Button>
                        )}
                    </Subscribe>
                </DialogFooter>
            </form>
        </DialogContent>
    );
};

export const TagCreateModal = () => {
    return <Dialog>
        <DialogTrigger asChild>
            <Button>Create Tag</Button>
        </DialogTrigger>
        <TagCreateModalContent />
    </Dialog>;
};

export const TagCreateModalForced: FC<{ name: string }> = ({ name }) => (
    <Dialog defaultOpen>
        <TagCreateModalContent name={name} />
    </Dialog>
);
