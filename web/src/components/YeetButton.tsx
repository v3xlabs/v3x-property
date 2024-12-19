import { FC } from 'react';

import { useUpdateItemLocation } from '@/api/item';
import { useMe } from '@/api/me';

import { Button } from './ui/Button';

export const YeetButton: FC<{ item_id: string }> = ({ item_id }) => {
    const { data: me } = useMe();
    const { mutate: updateItemLocation } = useUpdateItemLocation();

    return (
        <Button
            onClick={() =>
                updateItemLocation({
                    item_id,
                    data: {
                        item_id,
                        location_user_id: me?.user_id,
                    },
                })}
        >
            Take Item
        </Button>
    );
};
