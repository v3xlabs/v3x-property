import { useOwnedItems } from '@/api/item';

import { ItemPreview } from './item/ItemPreview';

export const AllOwnedItems = () => {
    const { data } = useOwnedItems();

    return (
        <div className="space-y-2">
            {data?.map((item) => (
                <div className="card no-padding">
                    <ItemPreview item_id={item.item_id} />
                </div>
            ))}
        </div>
    );
};
