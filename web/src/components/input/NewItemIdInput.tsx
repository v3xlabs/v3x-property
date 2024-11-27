import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FiRefreshCcw } from 'react-icons/fi';

import { isValidId } from '../../api/generate_id';
import { BaseInput, BaseInputProperties } from './BaseInput';

const placeholderValues = ['000001', '123456', 'AA17C', 'ABCDEF', '000013'];

export const NewItemIdInput = (properties: BaseInputProperties) => {
    const [value, setValue] = useState(properties.defaultValue);
    const [placeholderValue, setPlaceholderValue] = useState(
        placeholderValues[0]
    );
    const { mutate: generateId } = useMutation({
        mutationFn: async () => {
            // TODO: Hook up to API Endpoint
            // Currently just returns a random value

            return placeholderValues[
                Math.floor(Math.random() * placeholderValues.length)
            ];
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

    const isValid = isValidId(value);

    return (
        <BaseInput
            {...properties}
            placeholder={placeholderValue}
            value={value || ''}
            onChange={(value) => {
                setValue(value);
                properties.onChange?.(value);
            }}
            errorMessage={
                !isValid
                    ? 'Identifier must be alphanumeric (a-z0-9)'
                    : undefined
            }
            suffix={
                <>
                    <div className="h-auto">
                        <button
                            className="!h-full btn"
                            onClick={() => generateId()}
                        >
                            <FiRefreshCcw />
                        </button>
                    </div>
                </>
            }
        />
    );
};
