import { FC } from 'react';
import { HiOutlineSparkles } from 'react-icons/hi2';

import { useItemSuggestion } from '@/api/item/intelligence';

import { AgentDecoder } from '../tmp/AgentDecoder';
import { Button } from '../ui/Button';
import { Popover, PopoverTrigger } from '../ui/Popover';

export const ItemIntelligentSuggest: FC<{ itemId: string }> = ({ itemId }) => {
    const { mutate, data, isIdle, status } = useItemSuggestion({ itemId });

    return (
        <div>
            <Popover defaultOpen={!isIdle}>
                <PopoverTrigger
                    asChild
                    onClick={() => {
                        // if () {
                        // }
                        if (!['loading', 'success'].includes(status)) {
                            console.log('CLICKED');
                            mutate();
                        }
                    }}
                >
                    <Button type="button">
                        <HiOutlineSparkles />
                        Suggest
                    </Button>
                </PopoverTrigger>
                <AgentDecoder conversation={data?.contents} />
            </Popover>
        </div>
    );
};
