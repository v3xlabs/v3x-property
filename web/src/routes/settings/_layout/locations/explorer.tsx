import { createFileRoute } from '@tanstack/react-router';
import { FC } from 'react';
import { FiFile, FiFolder } from 'react-icons/fi';

import { useItemItems } from '@/api/item';
import { useLocationItems, useLocationLocations } from '@/api/locations';

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
            <FiFile /> {item_id}
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
    const { data: locations } = useLocationLocations(location_id);
    const { data: items } = useLocationItems(location_id);

    return (
        <div>
            <div className="flex items-center gap-1">
                <FiFolder /> {location_id}
            </div>
            <div className="pl-4">
                <ul>
                    {locations?.map((location) => <li key={location.location_id}>
                        <LocationNode location_id={location.location_id} />
                    </li>)}
                    {items?.map((item) => <li key={item.item_id}>
                        <ItemNode item_id={item.item_id} />
                    </li>)}
                </ul>
            </div>
        </div>
    );
};

function RouteComponent() {
    const { data: locations } = useLocationLocations('_');

    return <div className="card">
        <ul>
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
