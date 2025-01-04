import clsx from 'clsx';
import { ComponentPropsWithoutRef, ReactNode, useId } from 'react';

import { Input, Label } from '@/gui';

export type BaseInputProperties = {
    label?: ReactNode;
    suffix?: ReactNode;
    onChange?: (_value: string) => void;
    errorMessage?: string;
    description?: string;
    width?: 'full' | 'fit';
} & Omit<ComponentPropsWithoutRef<typeof Input>, 'onChange'>;

export const BaseInput = ({
    label,
    className,
    type,
    suffix,
    onChange,
    errorMessage,
    description,
    width = 'fit',
    required,
    ...rest
}: BaseInputProperties) => {
    const id = useId();

    return (
        <div className="w-full space-y-2">
            {label && (
                <Label htmlFor={id}>
                    {label}
                    {required && (
                        <span
                            className={clsx('', errorMessage && 'text-red-500')}
                        >
                            *
                        </span>
                    )}
                </Label>
            )}
            <div
                className={clsx(
                    'flex items-stretch justify-start gap-2',
                    width === 'full' && 'w-full'
                )}
            >
                <div className={clsx(width === 'full' ? 'grow' : '', 'flex items-center gap-2')}>
                    <Input
                        type={type || 'text'}
                        id={id}
                        className={clsx(
                            className,
                            width === 'full' && 'w-full',
                            type == 'color' && 'aspect-square rounded-md'
                        )}
                        onChange={(event) => onChange?.(event.target.value)}
                        required={required}
                        style={{
                            backgroundColor: type == 'color' ? rest.value as string : undefined,
                            ...rest.style,
                        }}
                        {...rest}
                    />
                    {
                        type == 'color' && (
                            <Input
                                type="text"
                                id={id}
                                value={rest.value as string}
                                onChange={(event) => onChange?.(event.target.value)}
                                required={required}
                                className=""
                                style={{
                                    backgroundColor: rest.value as string,
                                }}
                            />
                        )
                    }
                </div>
                {suffix}
            </div>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {description && (
                <p className="text-sm text-neutral-500">{description}</p>
            )}
        </div>
    );
};
