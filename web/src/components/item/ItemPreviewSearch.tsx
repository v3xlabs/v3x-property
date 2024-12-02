import { SearchableItem } from '@/api/search';

import { ItemPreview } from './ItemPreview';

export const ItemPreviewSearch = ({ item }: { item: SearchableItem }) => {
    return (
        <div className="card no-padding">
            <ItemPreview item_id={item.item_id.toString()} />
        </div>
    );
};
