import type { ClassValue } from 'clsx';
import { FC, PropsWithChildren, ReactNode } from 'react';

import { cn } from '@/util/style';

export type SCPageProperties = PropsWithChildren<{
    title: string;
    width?: 'xl' | '2xl' | '3xl' | '4xl';
    suffix?: ReactNode;
    className?: ClassValue;
}>;

export const SCPage: FC<SCPageProperties> = ({
    children,
    title,
    width = '4xl',
    suffix,
    className,
}) => {
    return (
        <div
            className={cn(
                'p-2 mt-8 mx-auto w-full space-y-4 pb-64',
                width === 'xl' && 'max-w-xl',
                width === '2xl' && 'max-w-2xl',
                width === '3xl' && 'max-w-3xl',
                width === '4xl' && 'max-w-4xl',
                className
            )}
        >
            <div className="flex items-end justify-between">
                <h1 className="h1 pl-4">{title}</h1>
                {suffix}
            </div>
            {children}
        </div>
    );
};
