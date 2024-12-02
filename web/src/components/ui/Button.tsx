import { Slot } from '@radix-ui/react-slot';
import { type VariantProps } from 'class-variance-authority';
import { ButtonHTMLAttributes, forwardRef } from 'react';

import { cn, cvax } from '@/util/style';

const [buttonVariants, buttonVariantsConfig] = cvax(
    // 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    [
        // Layout
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium',

        // State
        'ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    ],
    // 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline focus:outline-2 outline-offset-2 outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50',
    {
        variants: {
            variant: {
                default:
                    'bg-white text-neutral-800 border border-solid border-neutral-200 hover:bg-neutral-50',
                primary: [
                    'text-white border',
                    'bg-blue-500 hover:bg-blue-600 border-blue-400 hover:border-blue-500',
                    'disabled:bg-blue-300 disabled:text-blue-500 disabled:border-blue-300 disabled:hover:bg-blue-300 disabled:hover:border-blue-300 disabled:cursor-not-allowed',
                ],
                secondary: [
                    'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200',
                    'disabled:bg-neutral-100 disabled:text-neutral-400 disabled:border-neutral-200 disabled:hover:bg-neutral-100 disabled:cursor-not-allowed',
                ],
                ghost: [
                    'hover:bg-neutral-100 text-neutral-700 border-transparent',
                    'disabled:bg-neutral-100 disabled:text-neutral-400 disabled:border-transparent disabled:hover:bg-neutral-100 disabled:cursor-not-allowed',
                ],
                link: 'text-blue-500 hover:underline border-transparent bg-transparent',
                success: [
                    'bg-green-500 text-white hover:bg-green-600 border border-green-400 hover:border-green-500',
                    'disabled:bg-green-300 disabled:text-green-500 disabled:border-green-300 disabled:hover:bg-green-300 disabled:hover:border-green-300 disabled:cursor-not-allowed',
                ],
                warning: [
                    'bg-yellow-500 text-white hover:bg-yellow-600 border border-yellow-400 hover:border-yellow-500',
                    'disabled:bg-yellow-300 disabled:text-yellow-500 disabled:border-yellow-300 disabled:hover:bg-yellow-300 disabled:hover:border-yellow-300 disabled:cursor-not-allowed',
                ],
                destructive: [
                    'text-white border',
                    'bg-red-500 hover:bg-red-600 border-red-400 hover:border-red-500',
                    'disabled:bg-red-300 disabled:text-red-500 disabled:border-red-300 disabled:hover:bg-red-300 disabled:hover:border-red-300 disabled:cursor-not-allowed',
                ],
            },
            size: {
                default: 'h-10 px-4 py-2 text-sm',
                sm: 'h-8 px-3 py-1 text-sm',
                lg: 'h-12 px-6 py-2 text-base',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProperties
    extends ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProperties>(
    (
        { className, variant, size, asChild = false, ...properties },
        reference
    ) => {
        const Comp = asChild ? Slot : 'button';

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={reference}
                {...properties}
            />
        );
    }
);

Button.displayName = 'Button';

export { Button, buttonVariants, buttonVariantsConfig };
