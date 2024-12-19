import { FC } from 'react';

import { Location, useLocation } from '@/api/locations';

export const LocationPreview: FC<{
    location_id?: string;
    location?: Location;
}> = (properties) => {
    const location_id =
        properties.location_id || properties.location?.location_id;
    const { data: location } = useLocation(location_id);
    const data = location || properties.location;

    return <div className="card">{data?.name}</div>;
};
