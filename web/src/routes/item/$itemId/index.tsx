import {
    useQueryErrorResetBoundary,
    useSuspenseQuery,
} from '@tanstack/react-query';
import {
    createFileRoute,
    Link,
    redirect,
    useRouter,
} from '@tanstack/react-router';
import { useEffect } from 'react';

import { formatId, getInstanceSettings } from '@/api/instance_settings';
import { getItemById, getItemMedia } from '@/api/item';
import { getPolicy } from '@/api/policy';
import { ItemLogSection } from '@/components/logs/ItemLogSection';
import { MediaGallery } from '@/components/media/MediaGallery';
import { Button } from '@/components/ui/Button';
import { UserProfile } from '@/components/UserProfile';
import { SCPage } from '@/layouts/SimpleCenterPage';
import { queryClient } from '@/util/query';

export const Route = createFileRoute('/item/$itemId/')({
    // if item_id is not formatId(item_id, instanceSettings), redirect to the formatted item_id
    loader: async ({ params }) => {
        // Ensure instance settings are loaded
        const instanceSettings = await queryClient.ensureQueryData(
            getInstanceSettings
        );

        const formattedItemId = formatId(params.itemId, instanceSettings);

        // Redirect if the item_id is not formatted
        if (formattedItemId !== params.itemId) {
            console.log('redirecting to', formattedItemId);

            return redirect({ to: `/item/${formattedItemId}` });
        }

        const x = await queryClient.ensureQueryData(
            getPolicy('item', params.itemId)
        );

        if (!x.includes('read')) {
            throw new Error('Unauthorized (Invalid Policy)');
        }

        // Preload item and media
        return Promise.all([
            queryClient.ensureQueryData(getItemById(params.itemId)),
            queryClient.ensureQueryData(getItemMedia(params.itemId)),
        ]);
    },
    component: () => {
        const { itemId } = Route.useParams();

        const item = useSuspenseQuery(getItemById(itemId));
        const media = useSuspenseQuery(getItemMedia(itemId));

        return (
            <SCPage
                title={(item.data && item.data.name) || `Item ${itemId}`}
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
                        <MediaGallery media_ids={media.data} />
                    </div>
                    <div className="p-4">
                        {item.data?.owner_id && (
                            <div>
                                <h3>Owner</h3>
                                <UserProfile user_id={item.data.owner_id} />
                            </div>
                        )}
                    </div>
                    <div>
                        <p>{item.data?.product_id}</p>
                    </div>
                </div>
                <ItemLogSection item_id={itemId} />
            </SCPage>
        );
    },
    errorComponent: ({ error }) => {
        const router = useRouter();
        // const parameters = Route.useParams();
        const queryErrorResetBoundary = useQueryErrorResetBoundary();

        useEffect(() => {
            // Reset the query error boundary
            queryErrorResetBoundary.reset();
        }, [queryErrorResetBoundary]);

        return (
            <SCPage title={'Could not load the item'}>
                <div className="card space-y-3">
                    <p>There was an issue loading the item.</p>
                    <code className="block bg-muted p-2 rounded-md">
                        {error.message}
                    </code>
                    <Button onClick={() => router.invalidate()}>Retry</Button>
                </div>
            </SCPage>
        );
    },
});
