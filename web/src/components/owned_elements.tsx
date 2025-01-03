import { FC } from 'react';

import { useOwnedItems } from '@/api';

import { ItemPreview } from './item/ItemPreview';

export const AllOwnedItems: FC<{ variant: 'full' | 'large' }> = ({
    variant,
}) => {
    const { data } = useOwnedItems();

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2 2xl:grid-cols-2">
                {data?.map((item) => (
                    <div className="card no-padding" key={item.item_id}>
                        <ItemPreview item_id={item.item_id} variant={variant} />
                    </div>
                ))}
            </div>
        </div>
    );
};
