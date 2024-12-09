import { useForm } from '@tanstack/react-form';
import { useSuspenseQuery } from '@tanstack/react-query';

import {
    ConfigurableInstanceSettings,
    getInstanceSettings,
    useUpdateInstanceSettings,
} from '@/api/instance_settings';

import { BaseInput } from '../input/BaseInput';
import { Button } from '../ui/Button';

export const InstanceSettings = () => {
    const { data: instanceSettings } = useSuspenseQuery(getInstanceSettings);
    const { mutateAsync: updateInstanceSettings } = useUpdateInstanceSettings();
    const { Field, Subscribe, handleSubmit } = useForm({
        defaultValues: {
            instance_id: 1,
            id_casing_preference: instanceSettings.id_casing_preference,
            last_item_id: instanceSettings.last_item_id,
        } as ConfigurableInstanceSettings,
        onSubmit: async ({ value }) => {
            console.log('Instance Settings Submitted', value);
            await updateInstanceSettings(value);
        },
    });

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                handleSubmit();
            }}
        >
            <h2>Instance Settings</h2>
            <pre className="bg-black/5 p-4 rounded-lg text-wrap">
                {JSON.stringify(instanceSettings, undefined, 2)}
            </pre>
            <div>
                <Field
                    name="id_casing_preference"
                    children={(field) => {
                        return (
                            <>
                                {/* @ts-ignore */}
                                <select {...field.props}>
                                    {['upper', 'lower'].map((value) => {
                                        return (
                                            <option value={value}>
                                                {value}
                                            </option>
                                        );
                                    })}
                                </select>
                            </>
                        );
                    }}
                />
            </div>
            <Field
                name="last_item_id"
                children={(field) => {
                    return (
                        <BaseInput
                            id="last_item_id"
                            label="Last Item ID"
                            value={field.state.value}
                            type="number"
                            onChange={(value) =>
                                field.handleChange(Number(value))
                            }
                            errorMessage={field.state.meta.errors.join(', ')}
                            description="The last item ID is used to generate new item identifiers, this field is automatically updated when you create a new item."
                        />
                    );
                }}
            />
            <Subscribe>
                {({ isValid }) => {
                    return (
                        <Button type="submit" disabled={!isValid}>
                            Save
                        </Button>
                    );
                }}
            </Subscribe>
        </form>
    );
};
