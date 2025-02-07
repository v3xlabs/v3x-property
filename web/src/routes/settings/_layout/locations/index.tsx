import { createFileRoute } from '@tanstack/react-router';
import { FiPlus } from 'react-icons/fi';

import { useLocations } from '@/api';
import { CreateLocationModal } from '@/components/location/CreateLocationModal';
import { SpecificLocationPreview } from '@/components/location/LocationPreview';
import { Button, Dialog, DialogTrigger } from '@/gui';

export const Route = createFileRoute('/settings/_layout/locations/')({
    component: RouteComponent,
    context() {
        return {
            title: 'Locations',
            suffix: (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="icon">
                            <FiPlus />
                        </Button>
                    </DialogTrigger>
                    <CreateLocationModal />
                </Dialog>
            ),
        };
    },
});

function RouteComponent() {
    const { data: locations } = useLocations();

    return (
        <>
            <div className="card">
                <p>
                    These are the locations you have defined. A location is a place a
                    thing can be stored. Items can also be located at a user or with
                    another item.
                </p>
            </div>
            <ul className="space-y-2">
                {locations?.map((location) => (
                    <li key={location.location_id}>
                        <SpecificLocationPreview location={location} />
                    </li>
                ))}
            </ul>
        </>
    );
}
