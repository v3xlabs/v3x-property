import { createLazyFileRoute, Link } from '@tanstack/react-router';

import { SearchInput } from '@/components/search/SearchInput';
import { SCPage } from '@/layouts/SimpleCenterPage';

export const Route = createLazyFileRoute('/search/')({
    component: () => (
        <SCPage title="Search" width="2xl">
            <div className="w-full">
                <SearchInput />
            </div>
            <Link to="/item/$itemId/edit" params={{ itemId: '123' }}>
                Tasks
            </Link>
            <div>Results...</div>
        </SCPage>
    ),
});
