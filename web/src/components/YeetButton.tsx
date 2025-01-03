import { FC } from 'react';

import { useMe, useUpdateItemLocation } from '@/api';

import { Button } from '../gui/Button';

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
