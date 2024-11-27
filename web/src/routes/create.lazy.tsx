import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';

import { useApiCreateItem } from '../api/item';
import { NewItemIdInput } from '../components/input/NewItemIdInput';
import { isValidId } from '../api/generate_id';

const component = () => {
    const { mutate: createItem } = useApiCreateItem();
    const [item_id, setItemId] = useState('');
    const navigate = useNavigate();

    const isDisabled = !isValidId(item_id);

    return (
        <div className="p-2 mt-8 mx-auto w-full max-w-4xl space-y-4">
            <h1 className="h1">Create new Item</h1>
            <div className="w-full gap-4 border border-t-4 shadow-sm rounded-md pt-4">
                <div className="flex flex-col gap-2 px-6">
                    <NewItemIdInput
                        label="Item Identifier"
                        id="item-identifier"
                        value={item_id}
                        onChange={setItemId}
                    />
                </div>
                <p className="text-sm text-neutral-500 p-6">
                    To create a new item you will need to give it an identifier.
                    You can choose to use a generated identifier (by clicking
                    the generate icon) or you can choose to provide your own
                    (a-zA-Z0-9). Leading zeros will be trimmed.
                </p>
                <div className="flex items-center justify-end gap-2 px-6 pb-4">
                    <button
                        className="btn w-fit flex items-center gap-2"
                        onClick={async () => {
                            await createItem(item_id);
                            // navigate to the new item
                            navigate({
                                to: '/item/$itemId/edit',
                                params: { itemId: item_id },
                            });
                        }}
                        disabled={isDisabled}
                    >
                        Configure
                        <FiArrowRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Route = createLazyFileRoute('/create')({
    component,
});
