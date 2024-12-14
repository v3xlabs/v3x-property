import { createLazyFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { FaBox, FaTableCellsLarge } from 'react-icons/fa6';

import { AllOwnedItems } from '@/components/owned_elements';
import { Button } from '@/components/ui/Button';
import { SCPage } from '@/layouts/SimpleCenterPage';

export const Route = createLazyFileRoute('/items/')({
    component: () => {
        const [active_variant, setActiveVariant] = useState<'full' | 'large'>(
            'full'
        );

        return (
            <SCPage
                title="Items"
                width="2xl"
                suffix={
                    <div className="flex justify-end items-center gap-2">
                        {(
                            [
                                ['full', <FaBox />],
                                ['large', <FaTableCellsLarge />],
                            ] as const
                        ).map(([variant, icon]) => (
                            <Button
                                key={variant}
                                variant={
                                    variant === active_variant
                                        ? 'default'
                                        : 'secondary'
                                }
                                size="icon"
                                onClick={() => setActiveVariant(variant)}
                            >
                                {icon}
                            </Button>
                        ))}
                    </div>
                }
            >
                <AllOwnedItems variant={active_variant} />
            </SCPage>
        );
    },
});
