import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FiRefreshCcw } from 'react-icons/fi';

import { BASE_URL, useAuth } from '@/api';
import { BaseInput, BaseInputProperties, Button } from '@/gui';

const placeholderValues = ['000001', '123456', 'AA17C', 'ABCDEF', '000013'];

export const NewItemIdInput = (properties: BaseInputProperties) => {
    const [value, setValue] = useState(properties.defaultValue);
    const [placeholderValue, setPlaceholderValue] = useState(
        placeholderValues[0]
    );
    const { token } = useAuth();
    // TODO: Replace implementation w the hook
    // const { data: itemId, refetch } = useGenerateId();
    const { mutate: generateId } = useMutation({
        mutationFn: async () => {
            const response = await fetch(`${BASE_URL}item/next`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();

            return data.item_id;
        },
        onSuccess: (data) => {
            setValue(data);
            properties.onChange?.(data);
        },
    });

    useEffect(() => {
        if (value) return;

        const interval = setInterval(() => {
            setPlaceholderValue(
                placeholderValues[
                Math.floor(Math.random() * placeholderValues.length)
                ]
            );
        }, 2000);

        return () => clearInterval(interval);
    }, [value]);

    return (
        <BaseInput
            {...properties}
            placeholder={placeholderValue}
            value={value || ''}
            onChange={(value) => {
                setValue(value);
                properties.onChange?.(value);
            }}
            data-testid="new-item-id-input"
            suffix={
                <>
                    <div className="h-auto">
                        <Button
                            size="icon"
                            onClick={() => generateId()}
                            data-testid="generate-id-button"
                            type="button"
                        >
                            <FiRefreshCcw />
                        </Button>
                    </div>
                </>
            }
        />
    );
};
