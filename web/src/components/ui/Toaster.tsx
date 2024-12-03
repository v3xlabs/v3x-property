import { cx } from 'class-variance-authority';
import { ComponentProps } from 'react';
import { Toaster as Sonner } from 'sonner';

import { cn, tw } from '@/util/style';

type ToasterProperties = ComponentProps<typeof Sonner>;

const baseToast = cx(
    'flex items-center gap-2',
    'p-4 rounded-md w-[--width]',
    'text-sm',
    'bg-background text-foreground border border-border'
);

const Toaster = ({ ...properties }: ToasterProperties) => {
    return (
        <Sonner
            className="toaster group"
            toastOptions={{
                unstyled: true,
                classNames: {
                    // toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border',
                    // description: 'group-[.toast]:text-muted-foreground',
                    // actionButton:
                    //     'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                    // cancelButton:
                    //     'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
                    toast: cx(
                        'flex items-center gap-2',
                        'p-4 rounded-md w-[--width]',
                        'text-sm',
                        'bg-popover text-foreground border border-border'
                    ),
                    closeButton: '',
                    actionButton: 'bg-primary text-primary-foreground',
                    cancelButton: 'bg-muted text-muted-foreground',
                    // Toast types
                    info: tw('border-blue-200'),
                    success: tw('border-green-200 bg-green-50'),
                    error: tw('border-red-200 bg-red-50'),
                    warning: tw('border-yellow-200 bg-yellow-50'),
                },
            }}
            cn={cn}
            {...properties}
        />
    );
};

export { Toaster };
