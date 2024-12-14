import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { FaBox, FaPlus } from 'react-icons/fa6';
import { FaTableCellsLarge } from 'react-icons/fa6';

import { SearchInput } from '@/components/search/SearchInput';
import { Button } from '@/components/ui/Button';
import { SCPage } from '@/layouts/SimpleCenterPage';

export const Route = createLazyFileRoute('/search/')({
    component: () => {
        const [active_variant, setActiveVariant] = useState<'full' | 'large'>(
            'full'
        );

        return (
            <SCPage
                title="Search"
                width="2xl"
                suffix={
                    <div className="flex justify-end items-center gap-2">
                        <Button variant="default" size="icon" asChild>
                            <Link to="/create">
                                <FaPlus />
                            </Link>
                        </Button>
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
                                        ? 'primary'
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
                <div className="w-full">
                    <SearchInput variant={active_variant} />
                </div>
                {/* <Link to="/item/$itemId/edit" params={{ itemId: '123' }}>
                Tasks
            </Link>
            <div>Results...</div> */}
            </SCPage>
        );
    },
});
