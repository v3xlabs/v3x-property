import clsx from 'clsx';
import { FC, PropsWithChildren } from 'react';

export type SCPageProperties = PropsWithChildren<{
    title: string;
    width?: 'xl' | '2xl' | '3xl' | '4xl';
}>;

export const SCPage: FC<SCPageProperties> = ({
    children,
    title,
    width = '4xl',
}) => {
    return (
        <div
            className={clsx(
                'p-2 mt-8 mx-auto w-full space-y-4',
                width === 'xl' && 'max-w-xl',
                width === '2xl' && 'max-w-2xl',
                width === '3xl' && 'max-w-3xl',
                width === '4xl' && 'max-w-4xl'
            )}
        >
            <h1 className="h1">{title}</h1>
            {children}
        </div>
    );
};
