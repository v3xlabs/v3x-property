import { createFileRoute, useParams } from '@tanstack/react-router';

import { SCPage } from '../../../layouts/SimpleCenterPage';

export const Route = createFileRoute('/item/$itemId/edit')({
    component: () => {
        const { itemId } = useParams({ from: '/item/$itemId/edit' });

        return (
            <SCPage title={`Edit Item ${itemId}`}>
                Hello /item/$itemId/edit!
            </SCPage>
        );
    },
});
