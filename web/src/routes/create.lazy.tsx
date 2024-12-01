import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';

import { isValidId } from '../api/generate_id';
import { formatId, useInstanceSettings } from '../api/instance_settings';
import { useApiCreateItem } from '../api/item';
import { NewItemIdInput } from '../components/input/NewItemIdInput';
import { SCPage } from '../layouts/SimpleCenterPage';

const component = () => {
    const { data: instanceSettings } = useInstanceSettings();
    const navigate = useNavigate();
    const [item_id, setItemId] = useState('');
    const { mutate: createItem } = useApiCreateItem();

    const isDisabled = !isValidId(item_id);
    const formattedItemId = formatId(item_id, instanceSettings);

    return (
        <SCPage title="Create new Item" width="4xl">
            <div className="card">
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
                            if (!formattedItemId) return;

                            await createItem(formattedItemId);
                            // navigate to the new item
                            navigate({
                                to: '/item/$itemId/edit',
                                params: { itemId: formattedItemId },
                            });
                        }}
                        disabled={isDisabled}
                    >
                        Configure
                        <FiArrowRight />
                    </button>
                </div>
            </div>
        </SCPage>
    );
};

export const Route = createLazyFileRoute('/create')({
    component,
});
