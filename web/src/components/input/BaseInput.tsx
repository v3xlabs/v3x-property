import * as Label from '@radix-ui/react-label';
import clsx from 'clsx';
import { ReactNode } from 'react';

export type BaseInputProperties = {
    label: string;
    placeholder?: string;
    defaultValue?: string;
    id?: string;
    className?: string;
    type?: HTMLInputElement['type'];
    suffix?: ReactNode;
    value?: string;
    onChange?: (value: string) => void;
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
}: BaseInputProperties) => {
    return (
        <>
            <Label.Root className="LabelRoot w-fit" htmlFor={id}>
                {label}
            </Label.Root>
            <div className="flex items-stretch justify-start gap-2 h-fit w-fit">
                <div>
                    <input
                        type={type || 'text'}
                        id={id}
                        defaultValue={defaultValue}
                        placeholder={placeholder}
                        className={clsx(className, 'Input')}
                        onChange={(event) => onChange?.(event.target.value)}
                        value={value}
                    />
                </div>
                {suffix}
            </div>
        </>
    );
};
