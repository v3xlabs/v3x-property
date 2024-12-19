import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import { FC } from 'react';
import { match, P } from 'ts-pattern';

import { ItemLocation } from '@/api/item';
import { Location, useLocation } from '@/api/locations';

import { ItemPreview } from '../item/ItemPreview';
import { UserProfile } from '../UserProfile';

export const LocationPreview: FC<{
    itemLocation?: ItemLocation;
    variant?: 'compact' | 'full';
}> = ({ itemLocation, variant = 'full' }) => {
    return match(itemLocation)
        .with({ location_id: P.string }, ({ location_id }) => <SpecificLocationPreview location_id={location_id} variant={variant} />)
        .with({ location_item_id: P.string }, ({ location_item_id }) => <ItemPreview item_id={location_item_id} variant={variant} />)
        .with({ location_user_id: P.number }, ({ location_user_id }) => <UserProfile user_id={location_user_id} variant={variant} />)
        .otherwise(() => <></>);
};

export const SpecificLocationPreview: FC<{
    location_id?: string;
    location?: Location;
    variant?: 'compact' | 'full';
}> = (properties) => {
    const location_id =
        properties.location_id || properties.location?.location_id;
    const { data: location } = useLocation(location_id);
    const data = location || properties.location;

    if (!location_id) {
        return;
    }

    return (
        <Link
            to={'/location/$locationId'}
            params={{ locationId: location_id }}
            className={
                clsx(
                    'card no-padding flex cursor-pointer hover:bg-neutral-100',
                    properties.variant === 'compact' && 'px-2 py-0.5 text-sm',
                    properties.variant === 'full' && 'flex flex-col p-4'
                )
            }
        >
            <div>{data?.name}</div>
            <div className="text-sm text-neutral-500">
                    #{data?.location_id}
            </div>
        </Link>
    );
};
