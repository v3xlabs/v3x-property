import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { FaBox, FaPlus } from 'react-icons/fa6';
import { FaTableCellsLarge } from 'react-icons/fa6';
import { z } from 'zod';

import { SearchInput } from '@/components/search/SearchInput';
import { Button } from '@/components/ui/Button';
import { SCPage } from '@/layouts/SimpleCenterPage';

const viewModeSchema = z.enum(['full', 'large']);
const querySchema = z.string();

export const SearchPage = () => {
    const navigate = Route.useNavigate();
    const { view, query } = Route.useSearch();

    const [active_variant, setVariant] = useState<'full' | 'large'>(
        view ?? 'large'
    );

    const setActiveVariant = (variant: 'full' | 'large') => {
        setVariant(variant);
        navigate({
            search: (previous) => ({
                ...previous,
                view: variant,
            }),
            replace: true,
        });
    };

    return (
        <SCPage
            title="Search"
            width="3xl"
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
            <div className="w-full">
                <SearchInput variant={active_variant} />
            </div>
            {/* <Link to="/item/$itemId/edit" params={{ itemId: '123' }}>
            Tasks
        </Link>
        <div>Results...</div> */}
        </SCPage>
    );
};

export const Route = createFileRoute('/search/')({
    validateSearch: (search: { view?: 'full' | 'large' }) => {
        const view = viewModeSchema.safeParse(search.view);
        const query = querySchema.safeParse(search.query);

        return {
            view: view.success ? view.data : undefined,
            query: query.success ? query.data : undefined,
        };
    },
    component: SearchPage,
});
