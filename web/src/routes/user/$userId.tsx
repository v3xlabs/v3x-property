import { createFileRoute, useParams } from '@tanstack/react-router';

import { useUserById, useUserInventory } from '@/api';
import { ItemPreview } from '@/components/item/ItemPreview';
import { UserProfile } from '@/components/user/UserProfile';
import { SCPage } from '@/layouts';

export const Route = createFileRoute('/user/$userId')({
    component: () => {
        const { userId } = useParams({ from: '/user/$userId' });
        const user_id = Number.parseInt(userId);
        const { data: user, isLoading } = useUserById(user_id);
        const { data: inventory } = useUserInventory(user_id);

        return (
            <SCPage title="User Profile">
                <div className="flex flex-col gap-4">
                    <UserProfile user_id={user_id} />
                    <div>
                        <h2 className="h2">Items at this location</h2>
                        {
                            inventory && inventory.length > 0 ? (
                                <ul className="space-y-2">
                                    {
                                        inventory.map((item) => (
                                            <li key={item.item_id}>
                                                <ItemPreview item_id={item.item_id} />
                                            </li>
                                        ))
                                    }
                                </ul>
                            ) : (
                                <div className="rounded-md border-2 border-dashed p-4 text-neutral-700">
                                    <p>No items at this location</p>
                                    <p>Visit an item to add it to this location</p>
                                </div>
                            )
                        }
                    </div>
                </div>
            </SCPage>
        );
    },
});
