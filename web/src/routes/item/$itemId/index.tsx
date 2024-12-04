import {
    createFileRoute,
    Link,
    redirect,
    useParams,
} from '@tanstack/react-router';

import { formatId, getInstanceSettings } from '@/api/instance_settings';
import { useApiItemById, useApiItemMedia } from '@/api/item';
import { ItemLogSection } from '@/components/item/logs/ItemLogSection';
import { MediaGallery } from '@/components/media/MediaGallery';
import { Button } from '@/components/ui/Button';
import { UnauthorizedResourceModal } from '@/components/Unauthorized';
import { UserProfile } from '@/components/UserProfile';
import { SCPage } from '@/layouts/SimpleCenterPage';
import { queryClient } from '@/util/query';

export const Route = createFileRoute('/item/$itemId/')({
    // if item_id is not formatId(item_id, instanceSettings), redirect to the formatted item_id
    loader: async ({ context, params }) => {
        const instanceSettings = await queryClient.ensureQueryData(
            getInstanceSettings()
        );
        const formattedItemId = formatId(params.itemId, instanceSettings);

        if (formattedItemId !== params.itemId) {
            console.log('redirecting to', formattedItemId);

            return redirect({ to: `/item/${formattedItemId}` });
        }
    },
    component: () => {
        const { itemId } = useParams({ from: '/item/$itemId/' });

        const { data: item, error } = useApiItemById(itemId);
        const { data: media, error: mediaError } = useApiItemMedia(itemId);

        if (error) {
            return <UnauthorizedResourceModal />;
        }

        return (
            <SCPage
                title={(item && item.name) || `Item ${itemId}`}
                suffix={
                    <Button asChild>
                        <Link to="/item/$itemId/edit" params={{ itemId }}>
                            Edit
                        </Link>
                    </Button>
                }
            >
                <div className="card pt-4">
                    <div className="px-4">
                        <MediaGallery
                            media_ids={media ?? (item?.media || [])}
                        />
                    </div>
                    <div className="p-4">
                        {item?.owner_id && (
                            <div>
                                <h3>Owner</h3>
                                <UserProfile
                                    user_id={item.owner_id.toString()}
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <p>{item?.product_id}</p>
                    </div>
                </div>
                <ItemLogSection item_id={itemId} />
            </SCPage>
        );
    },
});
