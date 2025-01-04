import { FC } from 'react';
import { HiOutlineSparkles } from 'react-icons/hi2';

import { useItemSuggestion } from '@/api';
import { AgentDecoder } from '@/components/intelligence/AgentDecoder';
import { Button, Popover } from '@/gui';

export const ItemIntelligentSuggest: FC<{ itemId: string }> = ({ itemId }) => {
    const { mutate, data, isIdle, status, isPending } = useItemSuggestion({
        itemId,
    });

    return (
        <div>
            <Popover.Popover
                defaultOpen={!isIdle}
                onOpenChange={(open) => {
                    if (open && status == 'idle') {
                        console.log('CLICKED');
                        mutate();
                    }
                }}
            >
                <Popover.PopoverTrigger asChild>
                    <Button type="button">
                        <HiOutlineSparkles
                            className={
                                data?.status == 'loading' ? 'animate-hop' : ''
                            }
                        />
                        Suggest
                    </Button>
                </Popover.PopoverTrigger>
                <AgentDecoder
                    conversation={data?.contents}
                    onReThinkSteps={() => {
                        mutate();
                    }}
                />
            </Popover.Popover>
        </div>
    );
};
