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
import { FiCopy, FiEdit } from 'react-icons/fi';
import { toast } from 'sonner';

import { formatId, getInstanceSettings, getItemById, getItemLocation, getItemMedia, getItemTags, getPolicy } from '@/api';
import { ItemFields } from '@/components/item/ItemFields';
import { LocationPreview } from '@/components/location/LocationPreview';
import { ItemLogSection } from '@/components/logs/ItemLogSection';
import { MediaGallery } from '@/components/media/MediaGallery';
import { PrintLabelButton } from '@/components/print/PrintModal';
import { UserProfile } from '@/components/UserProfile';
import { YeetButton } from '@/components/YeetButton';
import { Button, LocationInputExecutive, Tag } from '@/gui';
import { SCPage } from '@/layouts';
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
                subtext={
                    <>
                        <span>{`#${itemId}`}</span>
                        <Button variant='ghost' size='small-icon' onClick={() => {
                            navigator.clipboard.writeText(itemId);
                            toast.success('Copied to clipboard');
                        }}><FiCopy size={10} className='size-2 text-xs' /></Button>
                    </>
                }
                suffix={
                    <div className="flex gap-2">
                        <PrintLabelButton label_id={itemId} />
                        <Button asChild size="icon">
                            <Link
                                to="/item/$itemId/edit"
                                params={{ itemId }}
                                aria-label="Edit"
                            >
                                <FiEdit />
                            </Link>
                        </Button>
                    </div>
                }
            >
                <div className="card no-padding space-y-4 py-4">
                    <div className="px-4">
                        <MediaGallery media_ids={media.data} />
                    </div>
                    <div className="px-4">
                        {item.data?.owner_id && (
                            <div>
                                <h3 className="font-bold">Owner</h3>
                                <UserProfile user_id={item.data.owner_id} />
                            </div>
                        )}
                    </div>
                    <ItemFields item_id={itemId} />
                    {tags && tags.length > 0 && (
                        <div className="px-4">
                            <h3>Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {tags?.map((tag) => (
                                    <Tag key={tag.tag_id} tag={tag} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <h2 className="h2">Location</h2>
                    <div className="flex w-full items-center justify-stretch gap-4">
                        {
                            location ? (
                                <div className="grow text-nowrap">
                                    <LocationPreview itemLocation={location} variant='full' />
                                </div>
                            ) : (
                                <div className="grow">
                                    This item does not have a location
                                </div>
                            )}
                        <div className="flex flex-col gap-2">
                            <LocationInputExecutive item_id={itemId} />
                            <YeetButton item_id={itemId} />
                        </div>
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
                    <code className="block rounded-md bg-muted p-2">
                        {error.message}
                    </code>
                    <Button onClick={() => router.invalidate()}>Retry</Button>
                </div>
            </SCPage>
        );
    },
});
