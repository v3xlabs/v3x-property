import clsx from 'clsx';
import { ComponentPropsWithoutRef, ReactNode, useId } from 'react';

import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export type BaseInputProperties = {
    label?: string;
    suffix?: ReactNode;
    onChange?: (_value: string) => void;
    errorMessage?: string;
    width?: 'full' | 'fit';
} & Omit<ComponentPropsWithoutRef<typeof Input>, 'onChange'>;

export const BaseInput = ({
    label,
    className,
    type,
    suffix,
    onChange,
    errorMessage,
    width = 'fit',
    ...rest
}: BaseInputProperties) => {
    const id = useId();

    return (
        <>
            {label && <Label htmlFor={id}>{label}</Label>}
            <div
                className={clsx(
                    'flex items-stretch justify-start gap-2',
                    width === 'full' && 'w-full'
                )}
            >
                <div className={width === 'full' ? 'grow' : ''}>
                    <Input
                        type={type || 'text'}
                        id={id}
                        className={clsx(
                            className,
                            width === 'full' && 'w-full'
                        )}
                        onChange={(event) => onChange?.(event.target.value)}
                        {...rest}
                    />
                </div>
                {suffix}
            </div>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        </>
    );
};
