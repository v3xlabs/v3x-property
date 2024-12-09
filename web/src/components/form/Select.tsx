import { ReactNode, useState } from 'react';
import { useId } from 'react';
import { FaArrowsUpDown, FaCheck } from 'react-icons/fa6';

import { cn } from '@/util/style';

import { Button } from '../ui/Button';
import * as Command from '../ui/Command';
import { Label } from '../ui/Label';
import * as Popover from '../ui/Popover';

// export type BaseInputProperties = ;

export type FieldOption = {
    label: string | ReactNode;
    value: string;
    icon?: (_properties: { selected: boolean }) => ReactNode;
};

export const FieldSelect = ({
    value,
    onChange,
    label,
    options,
    description,
    errorMessage,
    emptyMessage,
    placeholder,
}: {
    value: string;
    onChange?: (_value: string) => void;
    label?: string;
    options: FieldOption[];

    description?: string;
    errorMessage?: string;
    emptyMessage?: string;
    placeholder?: string;
}) => {
    const [open, setOpen] = useState(false);
    const id = useId();

    return (
        <>
            {label && <Label htmlFor={id}>{label}</Label>}
            {/* <div
                className={cx(
                    'flex items-stretch justify-start gap-2',
                    width === 'full' && 'w-full'
                )}
            >
                <div className={width === 'full' ? 'grow' : ''}>
                    <Input
                        type={type || 'text'}
                        id={id}
                        className={cx(className, width === 'full' && 'w-full')}
                        onChange={(event) => onChange?.(event.target.value)}
                        {...rest}
                    />
                </div>
            </div> */}
            <Popover.Root open={open} onOpenChange={setOpen}>
                <Popover.Trigger asChild>
                    <Button
                        variant="default"
                        type="button"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[200px] justify-between"
                    >
                        {value
                            ? options.find((option) => option.value === value)
                                  ?.label
                            : placeholder || 'Select an option...'}
                        <FaArrowsUpDown className="opacity-50" />
                    </Button>
                </Popover.Trigger>
                <Popover.Content className="w-[200px] p-0">
                    <Command.Root>
                        <Command.Input placeholder={placeholder} />
                        <Command.List>
                            <Command.Empty>
                                {emptyMessage || 'No options found.'}
                            </Command.Empty>
                            <Command.Group>
                                {options.map((option) => (
                                    <Command.Item
                                        key={option.value}
                                        value={option.value}
                                        onSelect={(currentValue) => {
                                            onChange?.(
                                                currentValue === value
                                                    ? ''
                                                    : currentValue
                                            );
                                            setOpen(false);
                                        }}
                                    >
                                        {option.label}
                                        {option.icon ? (
                                            option.icon({
                                                selected:
                                                    value === option.value,
                                            })
                                        ) : (
                                            <FaCheck
                                                className={cn(
                                                    'ml-auto',
                                                    value === option.value
                                                        ? 'opacity-100'
                                                        : 'opacity-0'
                                                )}
                                            />
                                        )}
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        </Command.List>
                    </Command.Root>
                </Popover.Content>
            </Popover.Root>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {description && (
                <p className="text-sm text-neutral-500">{description}</p>
            )}
        </>
    );
};
