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

import { formatId, useInstanceSettings } from '@/api/instance_settings';
import { useItemById, useItemMedia } from '@/api/item';
import { ItemLogSection } from '@/components/logs/ItemLogSection';
import { MediaGallery } from '@/components/media/MediaGallery';
import { Button } from '@/components/ui/Button';
import { UnauthorizedResourceModal } from '@/components/Unauthorized';
import { UserProfile } from '@/components/UserProfile';
import { SCPage } from '@/layouts/SimpleCenterPage';
import { queryClient } from '@/util/query';

export const Route = createFileRoute('/item/$itemId/')({
    // if item_id is not formatId(item_id, instanceSettings), redirect to the formatted item_id
    loader: async ({ params }) => {
        // Ensure instance settings are loaded
        const instanceSettings = await queryClient.ensureQueryData(
            useInstanceSettings.getFetchOptions()
        );

        const formattedItemId = formatId(params.itemId, instanceSettings);

        // Redirect if the item_id is not formatted
        if (formattedItemId !== params.itemId) {
            console.log('redirecting to', formattedItemId);

            return redirect({ to: `/item/${formattedItemId}` });
        }

        // Preload item and media
        return Promise.all([
            queryClient.ensureQueryData(
                useItemById.getFetchOptions({
                    item_id: params.itemId,
                })
            ),
            queryClient.ensureQueryData(
                useItemMedia.getFetchOptions({
                    item_id: params.itemId,
                })
            ),
        ]);
    },
    component: () => {
        const { itemId } = Route.useParams();

        const item = useSuspenseQuery(
            useItemById.getOptions({
                item_id: itemId,
            })
        );
        const media = useSuspenseQuery(
            useItemMedia.getOptions({
                item_id: itemId,
            })
        );

        if (item.error) {
            return <UnauthorizedResourceModal />;
        }

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
