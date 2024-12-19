import { useForm } from '@tanstack/react-form';

import { useTagCreate } from '@/api/tags';

import { BaseInput } from '../input/BaseInput';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';

const TagCreateModalContent = () => {
    const { mutateAsync: createTag } = useTagCreate();
    const { Field, Subscribe, handleSubmit } = useForm({
        defaultValues: {
            name: '',
        },
        onSubmit: async (values) => {
            console.log(values);
            const tag = await createTag({
                tag_id: 0,
                name: values.value.name,
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
                <div>
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
                </div>
                <DialogFooter>
                    <Button type="submit">Create</Button>
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