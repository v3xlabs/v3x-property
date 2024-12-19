import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { FaBox, FaPlus, FaTableCellsLarge } from 'react-icons/fa6';
import { z } from 'zod';

import { AllOwnedItems } from '@/components/owned_elements';
import { Button } from '@/components/ui/Button';
import { SCPage } from '@/layouts/SimpleCenterPage';

const viewModeSchema = z.enum(['full', 'large']);

export const ItemsOverviewPage = () => {
    const navigate = Route.useNavigate();
    const { view } = Route.useSearch();

    const [active_variant, setVariant] = useState<'full' | 'large'>(view);

    const setActiveVariant = (variant: 'full' | 'large') => {
        setVariant(variant);
        navigate({
            search: (previous: { view: 'full' | 'large' }) => ({
                ...previous,
                view: variant,
            }),
            replace: true,
        });
    };

    return (
        <SCPage
            title="Items"
            width="5xl"
            suffix={
                <div className="flex items-center justify-end gap-2">
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
            <AllOwnedItems variant={active_variant} />
        </SCPage>
    );
};

export const Route = createFileRoute('/items/')({
    validateSearch: (search: { view?: 'full' | 'large' }) => {
        const view = viewModeSchema.safeParse(search.view);

        return {
            view: view.success ? view.data : 'large',
        };
    },
    component: ItemsOverviewPage,
});
