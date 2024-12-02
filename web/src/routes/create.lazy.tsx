import { useForm } from '@tanstack/react-form';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { FiArrowRight } from 'react-icons/fi';

import { isValidId } from '@/api/generate_id';
import { formatId, useInstanceSettings } from '@/api/instance_settings';
import { useApiCreateItem } from '@/api/item';
import { NewItemIdInput } from '@/components/input/NewItemIdInput';
import { SCPage } from '@/layouts/SimpleCenterPage';

const component = () => {
    const { data: instanceSettings } = useInstanceSettings();
    const navigate = useNavigate();
    const { mutate: createItem } = useApiCreateItem();

    const { Field, Subscribe, handleSubmit } = useForm({
        defaultValues: {
            itemId: '',
        },
        onSubmit: async ({ value }) => {
            const formattedItemId = formatId(value.itemId, instanceSettings);

            if (!formattedItemId) return;

            await createItem(formattedItemId);

            // navigate to the new item
            navigate({
                to: '/item/$itemId/edit',
                params: { itemId: formattedItemId },
            });
        },
    });

    // const isDisabled = !state.isFormValid;
    // const formattedItemId = formatId(state.values.itemId, instanceSettings);

    return (
        <SCPage title="Create new Item" width="4xl">
            <div className="card">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleSubmit();
                    }}
                >
                    <Field
                        name="itemId"
                        validators={{
                            onChange: (value) =>
                                isValidId(value.value)
                                    ? undefined
                                    : 'Identifier must be alphanumeric (a-z0-9)',
                        }}
                        children={(field) => (
                            <>
                                <div className="flex flex-col gap-2 px-6">
                                    <NewItemIdInput
                                        label="Item Identifier"
                                        id="item-identifier"
                                        value={field.state.value}
                                        onChange={field.handleChange}
                                        errorMessage={field.state.meta.errors.join(
                                            ', '
                                        )}
                                    />
                                </div>
                                <p className="text-sm text-neutral-500 p-6">
                                    To create a new item you will need to give
                                    it an identifier. You can choose to use a
                                    generated identifier (by clicking the
                                    generate icon) or you can choose to provide
                                    your own (a-zA-Z0-9). Leading zeros will be
                                    trimmed.
                                </p>
                            </>
                        )}
                    />
                    <div className="flex items-center justify-end gap-2 px-6 pb-4">
                        <Subscribe
                            selector={(state) => [
                                state.canSubmit,
                                state.isSubmitting,
                            ]}
                            children={([canSubmit, isSubmitting]) => (
                                <button
                                    className="btn w-fit flex items-center gap-2"
                                    type="submit"
                                    data-testid="create-button"
                                    disabled={!canSubmit}
                                >
                                    Configure
                                    <FiArrowRight />
                                </button>
                            )}
                        />
                    </div>
                </form>
            </div>
        </SCPage>
    );
};

export const Route = createLazyFileRoute('/create')({
    component,
});
