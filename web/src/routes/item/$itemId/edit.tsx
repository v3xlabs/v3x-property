import { createFileRoute, Link, useParams } from '@tanstack/react-router';

import { SCPage } from '../../../layouts/SimpleCenterPage';

export const Route = createFileRoute('/item/$itemId/edit')({
    component: () => {
        const { itemId } = useParams({ from: '/item/$itemId/edit' });

        return (
            <SCPage title={`Edit Item ${itemId}`}>
                <div className="card">
                    <p>Hello /item/$itemId/edit!</p>
                    <Link
                        to="/item/$itemId"
                        params={{ itemId }}
                        className="btn"
                    >
                        Save
                    </Link>
                </div>
            </SCPage>
        );
    },
});
