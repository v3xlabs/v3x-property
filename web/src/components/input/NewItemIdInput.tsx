import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FiRefreshCcw } from 'react-icons/fi';

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
            onChange={setValue}
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
