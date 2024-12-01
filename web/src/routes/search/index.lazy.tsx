import { createLazyFileRoute } from '@tanstack/react-router';

import { SearchInput } from '../../components/search/SearchInput';
import { SCPage } from '../../layouts/SimpleCenterPage';

export const Route = createLazyFileRoute('/search/')({
    component: () => (
        <SCPage title="Search" width="2xl">
            <div className="w-full">
                <SearchInput />
            </div>
            <div>Results...</div>
        </SCPage>
    ),
});
