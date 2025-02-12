import { useVirtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';
import { FC, ReactNode, useEffect, useId, useMemo, useRef, useState } from 'react';
import { FaArrowsUpDown } from 'react-icons/fa6';
import { FiChevronRight } from 'react-icons/fi';
import { match } from 'ts-pattern';

import { Button } from '../Button';
import * as Command from '../Command';
import { Label } from '../Label';
import * as Popover from '../Popover';

export type FieldOption = {
    label: string | ReactNode;
    value: string;
    icon?: (_properties: { selected: boolean }) => ReactNode;
    group?: boolean;
    back?: boolean;
};

export type FieldSelectProperties = {
    value: string;
    onChange?: (_value: string) => boolean;
    onSearch?: (_search: string) => void;
    label?: string;
    options: FieldOption[];

    description?: ReactNode;
    errorMessage?: string;
    emptyMessage?: string;
    placeholder?: string;
    justifyBetween?: boolean;
    suffix?: ReactNode;
    popoverWidth?: string;
    searchFn?: (_search: string) => FieldOption[];
};

export const FieldSelect: FC<FieldSelectProperties> = ({
    value,
    onChange,
    label,
    options,
    description,
    errorMessage,
    emptyMessage,
    placeholder,
    onSearch,
    justifyBetween = false,
    suffix,
    searchFn,
    popoverWidth = '200px',
}) => {
    const [open, setOpen] = useState(false);
    const id = useId();

    // The scrollable element for your list
    const parentReference = useRef<HTMLDivElement>(null);

    const [search, setSearch] = useState(value);
    const [nonce, setNonce] = useState(0);

    const filteredOptions = useMemo(() => {
        if (search == '') return options;

        if (searchFn) {
            return searchFn(search);
        }

        return options.filter((option) =>
            option.value.toLowerCase().includes(search.toLowerCase())
        );
    }, [options, search, nonce]);

    const count = filteredOptions.length;
    // The virtualizer
    const rowVirtualizer = useVirtualizer({
        count,
        getScrollElement: () => parentReference.current,
        estimateSize: () => 35,
        overscan: 5,
        paddingStart: 4,
        paddingEnd: 4,
        enabled: open && count > 0,
    });

    useEffect(() => {
        rowVirtualizer.scrollToOffset(0);
        onSearch?.(search);
    }, [search]);

    useEffect(() => {
        if (open) {
            const z = setTimeout(() => {
                setNonce(nonce + 1);
            }, 10);

            return () => clearTimeout(z);
        }
    }, [open]);

    return (
        <div className="w-full space-y-2">
            {label && <Label htmlFor={id}>{label}</Label>}
            <div
                className={clsx(
                    'flex items-stretch justify-start gap-2'
                    // width === 'full' && 'w-full'
                )}
            >
                <Popover.Root open={open} onOpenChange={setOpen}>
                    <Popover.Trigger asChild>
                        <Button
                            variant="default"
                            type="button"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                        >
                            {value
                                ? options.find(
                                    (option) => option.value === value
                                )?.label
                                : 'Select an option...'}
                            <FaArrowsUpDown className="opacity-50" />
                        </Button>
                    </Popover.Trigger>
                    <Popover.Content
                        className="p-0"
                        style={{ width: popoverWidth }}
                        onWheel={(event) => {
                            event.stopPropagation();
                        }}
                    >
                        <Command.Root shouldFilter={false}>
                            <Command.Input
                                placeholder={placeholder}
                                value={search}
                                onValueChange={(value) => {
                                    const search = value.trim().toLowerCase();

                                    setSearch(search);
                                }}
                            />
                            <Command.List className='text-foreground'>
                                {rowVirtualizer.getVirtualItems().length ===
                                    0 && (
                                    <Command.Empty>
                                        {emptyMessage || 'No options found.'}
                                    </Command.Empty>
                                )}
                                <div
                                    ref={parentReference}
                                    className="max-h-[200px] w-full overflow-y-auto"
                                >
                                    <div
                                        className="relative w-full"
                                        style={{
                                            height: `${rowVirtualizer.getTotalSize()}px`,
                                        }}
                                    >
                                        {rowVirtualizer
                                            .getVirtualItems()
                                            .map((virtualRow) => {
                                                const option =
                                                    filteredOptions[
                                                        virtualRow.index
                                                    ];

                                                return (
                                                    <Command.Item
                                                        key={option.value}
                                                        value={option.value}
                                                        onSelect={(
                                                            currentValue
                                                        ) => {
                                                            const result =
                                                                onChange?.(
                                                                    currentValue ===
                                                                        value
                                                                        ? ''
                                                                        : currentValue
                                                                );

                                                            if (result) {
                                                                setOpen(false);
                                                            }
                                                        }}
                                                        className={clsx(
                                                            'absolute left-0 top-0 w-full',
                                                            justifyBetween &&
                                                            !option.back &&
                                                            'flex items-center justify-between'
                                                        )}
                                                        style={{
                                                            height: `${virtualRow.size}px`,
                                                            transform: `translateY(${virtualRow.start}px)`,
                                                        }}
                                                    >
                                                        {match(option)
                                                            .with(
                                                                { group: true },
                                                                () => (
                                                                    <>
                                                                        <div className="flex items-center gap-2">
                                                                            {option.icon &&
                                                                                option.icon?.(
                                                                                    {
                                                                                        selected:
                                                                                            value ===
                                                                                            option.value,
                                                                                    }
                                                                                )}
                                                                            {
                                                                                option.label
                                                                            }
                                                                        </div>
                                                                        <FiChevronRight />
                                                                    </>
                                                                )
                                                            )
                                                            .with(
                                                                { back: true },
                                                                () => (
                                                                    <>
                                                                        {option.icon &&
                                                                            option.icon?.(
                                                                                {
                                                                                    selected:
                                                                                        value ===
                                                                                        option.value,
                                                                                }
                                                                            )}
                                                                        {
                                                                            option.label
                                                                        }
                                                                    </>
                                                                )
                                                            )
                                                            .otherwise(() => (
                                                                <>
                                                                    {
                                                                        option.label
                                                                    }
                                                                    {option.icon &&
                                                                        option.icon?.(
                                                                            {
                                                                                selected:
                                                                                    value ===
                                                                                    option.value,
                                                                            }
                                                                        )}
                                                                </>
                                                            ))}
                                                    </Command.Item>
                                                );
                                            })}
                                    </div>
                                </div>
                            </Command.List>
                        </Command.Root>
                    </Popover.Content>
                </Popover.Root>
                {suffix}
            </div>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {description && (
                <p className="text-sm text-neutral-500">{description}</p>
            )}
        </div>
    );
};
