import type { ClassValue } from 'clsx';
import { FC, PropsWithChildren, ReactNode, useEffect } from 'react';

import { cn } from '@/util/style';
import { getTitle } from '@/util/title';

export type SidePageProperties = PropsWithChildren<{
  title: string,
  width?: 'xl' | '2xl' | '3xl' | '4xl',
  suffix?: ReactNode,
  className?: ClassValue,
  sidebar?: ReactNode,
}>;

export const SidePage: FC<SidePageProperties> = ({
    children,
    title,
    width = '2xl',
    suffix,
    className,
    sidebar,
}) => {
    useEffect(() => {
        document.title = getTitle(title);
    }, [title]);

    return (
        <div
            className={cn(
                'p-4 mt-8 mx-auto w-full space-y-4 pb-64 flex gap-8 justify-center md:flex-row flex-col',
                className
            )}
        >
            {sidebar && <div className="w-full md:max-w-64">{sidebar}</div>}
            <div className="w-full max-w-xl space-y-4 lg:max-w-2xl">
                <div className="flex items-end justify-between">
                    <h1 className="h1 pl-4">{title}</h1>
                    {suffix}
                </div>
                {children}
            </div>
        </div>
    );
};
