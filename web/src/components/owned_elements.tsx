import { FC } from 'react';

import { useOwnedItems } from '@/api/item';

import { ItemPreview } from './item/ItemPreview';

export const AllOwnedItems: FC<{ variant: 'full' | 'large' }> = ({
    variant,
}) => {
    const { data } = useOwnedItems();

    return (
        <div className="space-y-4">
            <div className="gap-2 grid grid-cols-1 2xl:grid-cols-2">
                {data?.map((item) => (
                    <div className="card no-padding">
                        <ItemPreview item_id={item.item_id} variant={variant} />
                    </div>
                ))}
            </div>
        </div>
    );
};
