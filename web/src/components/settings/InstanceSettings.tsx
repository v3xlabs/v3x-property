import { useForm } from '@tanstack/react-form';
import { useSuspenseQuery } from '@tanstack/react-query';

import {
    ConfigurableInstanceSettings,
    getInstanceSettings,
    useHasPolicy, useUpdateInstanceSettings
} from '@/api';
import { BaseInput, Button, Dropdown, Label } from '@/gui';

export const InstanceSettings = () => {
    const { data: instanceSettings } = useSuspenseQuery(getInstanceSettings());
    const { ok: canEditSettings } = useHasPolicy(
        'instance',
        'settings',
        'write'
    );
    const { mutateAsync: updateInstanceSettings } = useUpdateInstanceSettings();
    const { Field, Subscribe, handleSubmit } = useForm({
        defaultValues: {
            instance_id: 1,
            id_casing_preference: instanceSettings.id_casing_preference,
            last_item_id: instanceSettings.last_item_id,
        } as ConfigurableInstanceSettings,
        validators: {
            onMount: () =>
                canEditSettings
                    ? undefined
                    : 'You are not allowed to edit the instance settings',
        },
        onSubmit: async ({ value }) => {
            console.log('Instance Settings Submitted', value);
            await updateInstanceSettings(value);
        },
    });

    return (
        <fieldset disabled={!canEditSettings}>
            <h2 className="h2">Instance Settings</h2>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    handleSubmit();
                }}
                className="space-y-4"
            >
                {/* <pre className="bg-black/5 p-4 rounded-lg text-wrap">
                    {JSON.stringify(instanceSettings.modules, undefined, 2)}
                </pre> */}
                <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                    <Field
                        name="id_casing_preference"
                        children={(field) => {
                            return (
                                <div className="card space-y-2">
                                    <Label htmlFor="id_casing_preference">
                                        ID Casing Preference
                                    </Label>
                                    <div>
                                        <Dropdown.Root>
                                            <Dropdown.Trigger asChild>
                                                <Button variant="default">
                                                    {field.state.value}
                                                </Button>
                                            </Dropdown.Trigger>
                                            <Dropdown.Content className="w-56">
                                                <Dropdown.Label>
                                                    ID Casing Preference
                                                </Dropdown.Label>
                                                <Dropdown.Separator />
                                                <Dropdown.RadioGroup
                                                    value={field.state.value}
                                                    onValueChange={(value) =>
                                                        field.handleChange(
                                                            value as
                                                            | 'upper'
                                                            | 'lower'
                                                        )
                                                    }
                                                >
                                                    {['upper', 'lower'].map(
                                                        (value) => {
                                                            return (
                                                                <Dropdown.RadioItem
                                                                    value={
                                                                        value
                                                                    }
                                                                >
                                                                    {value}
                                                                </Dropdown.RadioItem>
                                                            );
                                                        }
                                                    )}
                                                </Dropdown.RadioGroup>
                                            </Dropdown.Content>
                                        </Dropdown.Root>
                                    </div>
                                    <p className="text-sm text-neutral-500">
                                        This setting controls the
                                        capitalization-correction for items in
                                        your database. With "Upper" selected,
                                        the item ID "ab123" will be corrected to
                                        "AB123".
                                    </p>
                                </div>
                            );
                        }}
                    />
                    <Field
                        name="last_item_id"
                        children={(field) => {
                            return (
                                <div className="card">
                                    <BaseInput
                                        id="last_item_id"
                                        label="Last Item ID"
                                        value={field.state.value}
                                        type="number"
                                        onChange={(value) =>
                                            field.handleChange(Number(value))
                                        }
                                        errorMessage={field.state.meta.errors.join(
                                            ', '
                                        )}
                                        description="The last item ID is used to generate new item identifiers, this field is automatically updated when you create a new item."
                                    />
                                </div>
                            );
                        }}
                    />
                </div>
                <div className="flex justify-end">
                    {canEditSettings && (
                        <Subscribe>
                            {({ isValid }) => {
                                return (
                                    <Button type="submit" disabled={!isValid}>
                                        Save
                                    </Button>
                                );
                            }}
                        </Subscribe>
                    )}
                </div>
            </form>
        </fieldset>
    );
};
