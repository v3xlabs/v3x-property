import { FC, useEffect, useState } from 'react';
import { FiBox, FiCornerLeftUp,FiMapPin, FiUser  } from 'react-icons/fi';

import { useItemLocation, useLocations , useUpdateItemLocation , useUsers } from '@/api';
import { FieldOption, FieldSelect, FieldSelectProperties as FieldSelectProperties } from '@/gui';

export const LocationInput: FC<{ value: string, name?: string, forceCategory?: string, onChange: (_value: string) => void } & Partial<FieldSelectProperties>> = ({ value, name, forceCategory, onChange, ...properties }) => {
    const { data: locations } = useLocations();
    const { data: users } = useUsers();
    // const [search, setSearch] = useState<string | undefined>();
    const [category, setCategory] = useState<string | undefined>(forceCategory);
    const [location, setLocation] = useState<string | undefined>(value);

    const dataOptions = [
        !forceCategory && {
            label: 'Back',
            value: 'back',
            icon: () => <FiCornerLeftUp />,
            back: true,
        },
        ...(category == 'location' ? locations?.map((location) => ({
            label: location.name,
            value: 'location:' + location.location_id,
            icon: () => <span>{location.location_id}</span>
        })) ?? [] : []),
        ...(category == 'user' ? users?.map((user) => ({
            label: user.name,
            value: 'user:' + user.user_id,
            icon: () => <span>{user.user_id}</span>
        })) ?? [] : []),
    ].filter(Boolean) as FieldOption[];

    const menuOptions: FieldOption[] = [
        {
            label: 'Location',
            value: 'location',
            icon: () => <FiMapPin />,
        },
        {
            label: 'Item',
            value: 'item',
            icon: () => <FiBox />,
        },
        {
            label: 'User',
            value: 'user',
            icon: () => <FiUser />,
        },
    ];



    // const fuse = useMemo(() => {
    //     return new Fuse(dataOptions, {
    //         includeScore: true,
    //         keys: ['value'],
    //     });
    // }, [dataOptions]);

    const options = category == '' || category == undefined ? menuOptions : dataOptions;


    return (
        <FieldSelect
            {...properties}
            label={name}
            options={options}
            value={location ?? ''}
            // onSearch={setSearch}
            popoverWidth="420"
            justifyBetween
            onChange={(value) => {
                if (value == 'location') {
                    setCategory('location');

                    return false;
                } else if (value == 'item') {
                    setCategory('item');

                    return false;
                } else if (value == 'user') {
                    setCategory('user');

                    return false;
                } else if (value == 'back') {
                    setCategory('');

                    return false;
                }

                setLocation(value);
                onChange(value);

                return true;
            }}
            // searchFn={(search) => {
        //     return options;
        // }}
        />
    );
};

export const LocationInputExecutive: FC<{ item_id: string }> = ({ item_id }) => {
    const { data: itemLocation } = useItemLocation(item_id);
    const { mutateAsync: updateItemLocation } = useUpdateItemLocation();

    const [location, setLocation] = useState<string | undefined>();

    useEffect(() => {
        const stringifiedItemLocation = (() => {
            if (itemLocation?.location_id) {
                return 'location:' + itemLocation.location_id;
            } else if (itemLocation?.location_user_id) {
                return 'user:' + itemLocation.location_user_id;
            } else if (itemLocation?.location_item_id) {
                return 'item:' + itemLocation.location_item_id;
            }

            return '';
        })();

        setLocation(stringifiedItemLocation);
    }, [itemLocation]);


    return (
        <div>
            <LocationInput
                value={location ?? ''}
                onChange={(value) => {
                    setLocation(value);

                    if (value.startsWith('location:')) {
                        updateItemLocation({ item_id, data: { item_id, location_id: value.split(':')[1] } });
                    } else if (value.startsWith('user:')) {
                        updateItemLocation({ item_id, data: { item_id, location_user_id: Number.parseInt(value.split(':')[1]) } });
                    } else if (value.startsWith('item:')) {
                        updateItemLocation({ item_id, data: { item_id, location_item_id: value.split(':')[1] } });
                    }

                    return true;
                }}
            />
        </div>
    );
};