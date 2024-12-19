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
import { FiEdit } from 'react-icons/fi';

import { formatId, getInstanceSettings } from '@/api/instance_settings';
import { getItemById, getItemLocation, getItemMedia, getItemTags } from '@/api/item';
import { getPolicy } from '@/api/policy';
import { LocationInputExecutive } from '@/components/input/LocationInput';
import { ItemFields } from '@/components/item/ItemFields';
import { LocationPreview } from '@/components/location/LocationPreview';
import { ItemLogSection } from '@/components/logs/ItemLogSection';
import { MediaGallery } from '@/components/media/MediaGallery';
import { Tag } from '@/components/Tag';
import { Button } from '@/components/ui/Button';
import { UserProfile } from '@/components/UserProfile';
import { YeetButton } from '@/components/YeetButton';
import { SCPage } from '@/layouts/SimpleCenterPage';
import { queryClient } from '@/util/query';

export const Route = createFileRoute('/item/$itemId/')({
    // if item_id is not formatId(item_id, instanceSettings), redirect to the formatted item_id
    loader: async ({ params }) => {
        console.log('params', params);

        if (params.itemId == '') {
            return redirect({ to: '/items', search: { view: 'full' } });
        }

        // Ensure instance settings are loaded
        const instanceSettings = await queryClient.ensureQueryData(
            getInstanceSettings()
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
            queryClient.ensureQueryData(getItemTags(params.itemId)),
            queryClient.ensureQueryData(getItemLocation(params.itemId)),
        ]);
    },
    component: () => {
        const { itemId } = Route.useParams();

        const item = useSuspenseQuery(getItemById(itemId));
        const media = useSuspenseQuery(getItemMedia(itemId));
        const { data: location } = useSuspenseQuery(getItemLocation(itemId));
        const { data: tags } = useSuspenseQuery(getItemTags(itemId));

        return (
            <SCPage
                title={(item.data && item.data.name) || `Item ${itemId}`}
                subtext={`#${itemId}`}
                suffix={
                    <Button asChild>
                        <Link
                            to="/item/$itemId/edit"
                            params={{ itemId }}
                            aria-label="Edit"
                        >
                            <FiEdit />
                        </Link>
                    </Button>
                }
            >
                <div className="card no-padding pt-4">
                    <div className="px-4">
                        <MediaGallery media_ids={media.data} />
                    </div>
                    <div className="p-4">
                        {item.data?.owner_id && (
                            <div>
                                <h3 className="font-bold">Owner</h3>
                                <UserProfile user_id={item.data.owner_id} />
                            </div>
                        )}
                    </div>
                    <div className="flex w-full flex-wrap items-center gap-4 px-4">
                        {/* {item.data?. && ( */}
                        <div className="grow space-y-2">
                            <h3 className="font-bold">Location</h3>
                            <LocationInputExecutive item_id={itemId} />
                            {
                                location ? (
                                    <LocationPreview itemLocation={location} />
                                ) : (
                                    <div>
                                        This item does not have a location
                                    </div>
                                )}
                        </div>
                        <div className="space-y-2">
                            <YeetButton item_id={itemId} />
                        </div>
                        {/* )} */}
                    </div>
                    <ItemFields item_id={itemId} />
                    {tags && tags.length > 0 && (
                        <div className="p-4">
                            <h3>Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {tags?.map((tag) => (
                                    <Tag key={tag.tag_id} tag={tag} />
                                ))}
                            </div>
                        </div>
                    )}
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
                    <code className="bg-muted block rounded-md p-2">
                        {error.message}
                    </code>
                    <Button onClick={() => router.invalidate()}>Retry</Button>
                </div>
            </SCPage>
        );
    },
});
