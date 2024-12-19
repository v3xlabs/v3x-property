import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';

import { formatIdCasing, useInstanceSettings } from '@/api/instance_settings';
import { useCreateLocation } from '@/api/locations';

import { BaseInput } from '../input/BaseInput';
import { LocationInput } from '../input/LocationInput';
import { Button } from '../ui/Button';
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/Dialog';

export const CreateLocationModal = () => {
    const { data: instanceSettings } = useInstanceSettings();
    const { mutateAsync: createLocation } = useCreateLocation();
    const navigate = useNavigate();
    const { Field, Subscribe, handleSubmit } = useForm({
        defaultValues: {
            location_id: '',
            name: '',
            root_location_id: '',
        },
        onSubmit: async ({ value }) => {
            const response = await createLocation(value);

            navigate({ to: '/location/$locationId', params: { locationId: response.location_id } });
        }
    });

    return (
        <DialogContent>
            <form onSubmit={(event) => {
                event.preventDefault();
                handleSubmit();
            }}>

                <DialogHeader>
                    <DialogTitle>Setup a new Location</DialogTitle>
                    <DialogDescription>
                        A location is a place where you want to store items.
                        Examples of locations can be shelves, drawers, or even
                        locations in a warehouse.
                    </DialogDescription>
                    <div className="flex flex-col gap-2">
                        <Field name="location_id"
                            children={({ handleChange, handleBlur, state, }) => (
                                <BaseInput label="Location ID"
                                    onChange={handleChange}
                                    // onBlur={handleBlur}
                                    value={state.value}
                                    placeholder="A1"
                                    errorMessage={state.meta.errors.join(', ')}
                                    description="The ID of the location. This is used to identify the location in the database."
                                    required
                                />
                            )}
                        />
                        <Field name="name"
                            children={({ handleChange, handleBlur, state, form }) => (
                                <BaseInput label="Name"
                                    onChange={
                                        (value) => {
                                            handleChange(value);

                                            const formattedValue = formatIdCasing(value.replace(' ', ''), instanceSettings?.id_casing_preference);

                                            if (!form.state.fieldMeta.location_id.isTouched) {
                                                form.setFieldValue('location_id', formattedValue ?? '', {
                                                    dontUpdateMeta: true
                                                });
                                            }
                                        }
                                    }
                                    onBlur={handleBlur}
                                    value={state.value}
                                    placeholder="Alpha 1"
                                    errorMessage={state.meta.errors.join(', ')}
                                    description=""
                                    required
                                />
                            )}
                        />
                        <Field name="root_location_id"
                            children={({ handleChange, handleBlur, state, }) => (
                                <LocationInput
                                    name="Root Location"
                                    onChange={(value) => {
                                        handleChange(value.replace('location:', ''));

                                        return true;
                                    }}
                                    forceCategory='location'
                                    value={state.value}
                                    description='This is the parent location of this location. This is used to organize for examples shelves within a cabinet, or cabinets within a room.'
                                    errorMessage={state.meta.errors.join(', ')}
                                />
                            )}
                        />
                    </div>
                </DialogHeader>
                <DialogFooter>
                    <Subscribe>
                        {({ isValid }) => (
                            <Button type="submit" disabled={!isValid}>Create</Button>
                        )}
                    </Subscribe>
                </DialogFooter>
            </form>
        </DialogContent>
    );
};
