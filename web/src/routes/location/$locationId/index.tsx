import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { getLocation, getLocationItems, getLocationLocations } from '@/api';
import { ItemPreview } from '@/components/item/ItemPreview';
import { SpecificLocationPreview } from '@/components/location/LocationPreview';
import { SCPage } from '@/layouts';
import { queryClient } from '@/util/query';

export const Route = createFileRoute('/location/$locationId/')({
    loader: async ({ params }) => {
        const { locationId } = params;

        await Promise.all([
            queryClient.ensureQueryData(getLocation(locationId)),
            queryClient.ensureQueryData(getLocationItems(locationId)),
        ]);
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { locationId } = Route.useParams();
    const { data: location } = useSuspenseQuery(getLocation(locationId));
    const { data: items } = useSuspenseQuery(getLocationItems(locationId));
    const { data: locations } = useSuspenseQuery(getLocationLocations(locationId));

    console.log(location, items);

    return <SCPage
        title={location?.name ?? 'Location'}
        subtext={`#${locationId}`}
    >
        <div className="card">
            <p>This is a location</p>
            <div>
                TODO: Update parent location
            </div>
        </div>
        {
            location?.root_location_id && (
                <div>
                    <h2 className="h2">Parent Location</h2>
                    <SpecificLocationPreview location_id={location.root_location_id} />
                </div>
            )
        }
        {
            (
                !(locations && locations.length > 0 && items && items.length === 0) ||
                items && items.length > 0
            ) && <div>
                <h2 className="h2">Items at this location</h2>
                {
                    items && items.length > 0 ? (
                        <ul className="space-y-2">
                            {
                                items.map((item) => (
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
        }
        {
            locations && locations.length > 0 && (
                <>
                    <h2 className="h2">Locations at this location</h2>
                    <ul className="space-y-2">
                        {
                            locations.map((location) => (
                                <li key={location.location_id}>
                                    <SpecificLocationPreview location_id={location.location_id} />
                                </li>
                            ))
                        }
                    </ul>
                </>
            )
        }
    </SCPage>;
}
