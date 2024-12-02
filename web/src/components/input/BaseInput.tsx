import * as Label from '@radix-ui/react-label';
import clsx from 'clsx';
import { ReactNode } from 'react';

export type BaseInputProperties = {
    label?: string;
    placeholder?: string;
    defaultValue?: string;
    id?: string;
    className?: string;
    type?: HTMLInputElement['type'];
    suffix?: ReactNode;
    value?: string;
    onChange?: (value: string) => void;
    errorMessage?: string;
    width?: 'full' | 'fit';
};

export const BaseInput = ({
    label,
    placeholder,
    defaultValue,
    id,
    className,
    type,
    suffix,
    value,
    onChange,
    errorMessage,
    width = 'fit',
}: BaseInputProperties) => {
    return (
        <>
            {label && (
                <Label.Root className="LabelRoot w-fit" htmlFor={id}>
                    {label}
                </Label.Root>
            )}
            <div
                className={clsx(
                    'flex items-stretch justify-start gap-2',
                    width === 'full' && 'w-full'
                )}
            >
                <div className={width === 'full' ? 'grow' : ''}>
                    <input
                        type={type || 'text'}
                        id={id}
                        defaultValue={defaultValue}
                        placeholder={placeholder}
                        className={clsx(
                            className,
                            'input',
                            width === 'full' && 'w-full'
                        )}
                        onChange={(event) => onChange?.(event.target.value)}
                        value={value}
                    />
                </div>
                {suffix}
            </div>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        </>
    );
};
