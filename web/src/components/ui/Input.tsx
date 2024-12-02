import { ComponentProps, forwardRef } from 'react';

import { cn } from '@/util/style';

export const Input = forwardRef<HTMLInputElement, ComponentProps<'input'>>(
    ({ className, type, ...properties }, reference) => {
        return (
            <input
                type={type}
                className={cn(
                    // Layout
                    'flex h-10 w-full px-3 py-2',
                    // Appearance
                    'rounded-md border border-input bg-background text-base md:text-sm',
                    // File input specific
                    'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
                    // Placeholder
                    'placeholder:text-muted-foreground',
                    // Focus state
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
                    // Disabled state
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    className
                )}
                {...properties}
                ref={reference}
            />
        );
    }
);

Input.displayName = 'Input';
