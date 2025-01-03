import * as Collapsible from '@radix-ui/react-collapsible';
import { createFileRoute } from '@tanstack/react-router';
import clsx from 'clsx';
import { FC, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { LuFolder, LuFolderOpen } from 'react-icons/lu';

import { useItemItems } from '@/api/item';
import { useLocation, useLocationItems, useLocationLocations } from '@/api/locations';
import { ItemPreview } from '@/components/item/ItemPreview';

export const Route = createFileRoute('/settings/_layout/locations/explorer')({
    component: RouteComponent,
    context() {
        return {
            title: 'Locations Explorer',
        };
    },
});

export const ItemNode: FC<{ item_id: string }> = ({ item_id }) => {
    const { data: items } = useItemItems(item_id);

    return <div className="">
        <div className="flex items-center gap-1">
            <ItemPreview item_id={item_id} variant='compact' />
        </div>
        <div className="pl-4">
            <ul>
                {items?.map((item) => <li key={item.item_id}>
                    <ItemNode item_id={item.item_id} />
                </li>)}
            </ul>
        </div>
    </div>;
};

export const LocationNode: FC<{ location_id: string }> = ({ location_id }) => {
    const { data: location } = useLocation(location_id);
    const { data: locations } = useLocationLocations(location_id);
    const { data: items } = useLocationItems(location_id);
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Collapsible.Root open={isExpanded} onOpenChange={setIsExpanded}>
            <Collapsible.Trigger className='flex w-full cursor-pointer items-center justify-between gap-1 rounded-md px-4 py-1 hover:bg-gray-100'>
                <div className="flex items-center gap-1">
                    {isExpanded ? <LuFolderOpen /> : <LuFolder />} {location?.name || location_id}
                </div>
                <FiChevronDown className={clsx('transition-transform duration-100', isExpanded && 'rotate-180')} />
            </Collapsible.Trigger>
            <Collapsible.Content>
                <div className="pl-8">
                    <ul>
                        {locations?.map((location) => <li key={location.location_id}>
                            <LocationNode location_id={location.location_id} />
                        </li>)}
                        {items?.map((item) => <li key={item.item_id}>
                            <ItemNode item_id={item.item_id} />
                        </li>)}
                    </ul>
                </div>
            </Collapsible.Content>
        </Collapsible.Root>
    );
};

function RouteComponent() {
    const { data: locations } = useLocationLocations('_');

    return <div className="card space-y-2">
        <div className="h-1 w-full border-b">

        </div>
        <ul className="space-y-1 rounded-md border p-1">
            {locations?.map((location) => <li key={location.location_id}>
                <LocationNode location_id={location.location_id} />
            </li>)}
            {
                !locations || locations?.length === 0 && (
                    <p>
                        No locations founds
                    </p>
                )
            }
        </ul>
    </div>;
}
