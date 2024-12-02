'use client';

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/util/style';

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...properties }, reference) => (
    <AlertDialogPrimitive.Overlay
        className={cn(
            'fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            className
        )}
        {...properties}
        ref={reference}
    />
));

AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...properties }, reference) => (
    <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogPrimitive.Content
            ref={reference}
            className={cn(
                'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
                className
            )}
            {...properties}
        />
    </AlertDialogPortal>
));

AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({
    className,
    ...properties
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            'flex flex-col space-y-2 text-center sm:text-left',
            className
        )}
        {...properties}
    />
);

AlertDialogHeader.displayName = 'AlertDialogHeader';

const AlertDialogFooter = ({
    className,
    ...properties
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
            className
        )}
        {...properties}
    />
);

AlertDialogFooter.displayName = 'AlertDialogFooter';

const AlertDialogTitle = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...properties }, reference) => (
    <AlertDialogPrimitive.Title
        ref={reference}
        className={cn('text-lg font-semibold', className)}
        {...properties}
    />
));

AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...properties }, reference) => (
    <AlertDialogPrimitive.Description
        ref={reference}
        className={cn('text-sm text-muted-foreground', className)}
        {...properties}
    />
));

AlertDialogDescription.displayName =
    AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Action>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action> &
        VariantProps<typeof buttonVariants>
>(({ className, variant, size, ...properties }, reference) => (
    <AlertDialogPrimitive.Action
        ref={reference}
        className={cn(buttonVariants({ variant, size }), className)}
        {...properties}
    />
));

AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...properties }, reference) => (
    <AlertDialogPrimitive.Cancel
        ref={reference}
        className={cn(
            buttonVariants({ variant: 'secondary' }),
            'mt-2 sm:mt-0',
            className
        )}
        {...properties}
    />
));

AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export const Root = AlertDialog;
export const Action = AlertDialogAction;
export const Cancel = AlertDialogCancel;
export const Content = AlertDialogContent;
export const Description = AlertDialogDescription;
export const Footer = AlertDialogFooter;
export const Header = AlertDialogHeader;
export const Overlay = AlertDialogOverlay;
export const Portal = AlertDialogPortal;
export const Title = AlertDialogTitle;
export const Trigger = AlertDialogTrigger;

export {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    AlertDialogPortal,
    AlertDialogTitle,
    AlertDialogTrigger,
};
