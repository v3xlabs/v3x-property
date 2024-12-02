import { Link } from '@tanstack/react-router';

import { useApiOwnedItems } from '../api/item';

export const AllOwnedItems = () => {
    const { data } = useApiOwnedItems();

    return (
        <div className="space-y-2">
            {data?.map((item) => (
                <div
                    key={item.item_id}
                    className="card flex items-center gap-2 justify-between"
                >
                    <div>{item.item_id}</div>
                    <div>{item.name}</div>
                    <div>
                        <Link
                            to="/item/$itemId"
                            params={{ itemId: item.item_id }}
                            className="btn"
                        >
                            View
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
};
