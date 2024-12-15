import { FC } from 'react';
import { HiOutlineSparkles } from 'react-icons/hi2';

import { useItemSuggestion } from '@/api/item/intelligence';

import { AgentDecoder } from '../tmp/AgentDecoder';
import { Button } from '../ui/Button';
import { Popover, PopoverTrigger } from '../ui/Popover';

export const ItemIntelligentSuggest: FC<{ itemId: string }> = ({ itemId }) => {
    const { mutate, data, isIdle, status, isPending } = useItemSuggestion({
        itemId,
    });

    return (
        <div>
            <Popover
                defaultOpen={!isIdle}
                onOpenChange={(open) => {
                    if (open && status == 'idle') {
                        console.log('CLICKED');
                        mutate();
                    }
                }}
            >
                <PopoverTrigger asChild>
                    <Button type="button">
                        <HiOutlineSparkles
                            className={
                                data?.status == 'loading' ? 'animate-hop' : ''
                            }
                        />
                        Suggest
                    </Button>
                </PopoverTrigger>
                <AgentDecoder
                    conversation={data?.contents}
                    onReThinkSteps={() => {
                        mutate();
                    }}
                />
            </Popover>
        </div>
    );
};
