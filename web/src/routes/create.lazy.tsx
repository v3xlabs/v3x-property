import { createLazyFileRoute } from '@tanstack/react-router';
import { FiArrowRight } from 'react-icons/fi';

import { NewItemIdInput } from '../components/input/NewItemIdInput';

const component = () => {
    return (
        <div className="p-2 mt-8 mx-auto w-full max-w-4xl space-y-4">
            <h1 className="h1">Create new Item</h1>
            <div className="w-full gap-4 border border-t-4 shadow-sm rounded-md pt-4">
                <div className="flex flex-col gap-2 px-6">
                    <NewItemIdInput
                        label="Item Identifier"
                        id="item-identifier"
                    />
                </div>
                <p className="text-sm text-neutral-500 p-6">
                    To create a new item you will need to give it an identifier.
                    You can choose to use a generated identifier (by clicking
                    the generate icon) or you can choose to provide your own
                    (a-zA-Z0-9). Leading zeros will be trimmed.
                </p>
                <div className="flex items-center justify-end gap-2 px-6 pb-4">
                    <button className="btn w-fit flex items-center gap-2">
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
