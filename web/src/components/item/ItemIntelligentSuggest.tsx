import { FC } from 'react';

import { useItemSuggestion } from '@/api/item/intelligence';

import { Button } from '../ui/Button';

export const ItemIntelligentSuggest: FC<{ itemId: string }> = ({ itemId }) => {
    const { mutate, data } = useItemSuggestion({ itemId });

    return (
        <div>
            ItemIntelligentSuggest
            <Button onClick={() => mutate()} type="button">
                Suggest
            </Button>
            {data && <div>{JSON.stringify(data)}</div>}
        </div>
    );
};
