import { createFileRoute } from '@tanstack/react-router';

import { useLocations } from '@/api/locations';
import { LocationPreview } from '@/components/location/LocationPreview';

export const Route = createFileRoute('/settings/_layout/locations')({
    component: RouteComponent,
    context() {
        return {
            title: 'Locations',
        };
    },
});

function RouteComponent() {
    const { data: locations } = useLocations();

    return (
        <>
            <div className="card">
                <p>
                    These are the locations you have defined. A location is a
                    place a thing can be stored. Items can also be located at a
                    user or with another item.
                </p>
            </div>
            <ul>
                {locations?.map((location) => (
                    <li key={location.location_id}>
                        <LocationPreview location={location} />
                    </li>
                ))}
            </ul>
        </>
    );
}
