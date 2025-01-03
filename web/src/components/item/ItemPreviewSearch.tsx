import { SearchableItem } from '@/api';

import { ItemPreview } from './ItemPreview';

export const ItemPreviewSearch = ({
    item,
    variant,
}: {
    item: SearchableItem;
    variant: 'full' | 'large';
}) => {
    return (
        <div className="card no-padding">
            <ItemPreview item_id={item.item_id.toString()} variant={variant} />
        </div>
    );
};
