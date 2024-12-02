import { createFileRoute, Link, useParams } from '@tanstack/react-router';

import { useApiDeleteItem } from '../../../api/item';
import { SCPage } from '../../../layouts/SimpleCenterPage';

export const Route = createFileRoute('/item/$itemId/edit')({
    component: () => {
        const { itemId } = useParams({ from: '/item/$itemId/edit' });

        const { mutate: deleteItem } = useApiDeleteItem();

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
                    <button
                        className="btn btn-delete"
                        onClick={() => {
                            deleteItem(itemId);
                        }}
                    >
                        Delete
                    </button>
                </div>
            </SCPage>
        );
    },
});
