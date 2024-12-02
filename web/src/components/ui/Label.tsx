import * as LabelPrimitive from '@radix-ui/react-label';
import { type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn, cvax } from '@/util/style';

export const [labelVariants, labelVariantsConfig] = cvax(
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

const Label = React.forwardRef<
    React.ElementRef<typeof LabelPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
        VariantProps<typeof labelVariants>
>(({ className, ...properties }, reference) => (
    <LabelPrimitive.Root
        ref={reference}
        className={cn(labelVariants(), className)}
        {...properties}
    />
));

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
