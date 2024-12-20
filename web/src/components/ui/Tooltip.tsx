import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { FiInfo } from 'react-icons/fi';

export const Tooltip: FC<PropsWithChildren<{ trigger?: ReactNode }>> = ({
    trigger,
    children,
}) => {
    return (
        <TooltipPrimitive.TooltipProvider>
            <TooltipPrimitive.Tooltip>
                <TooltipPrimitive.TooltipTrigger>
                    {trigger || <FiInfo />}
                </TooltipPrimitive.TooltipTrigger>
                <TooltipPrimitive.TooltipContent
                    className="TooltipContent max-w-sm border drop-shadow-sm"
                    sideOffset={5}
                >
                    {children}
                    <TooltipPrimitive.TooltipArrow className="TooltipArrow" />
                </TooltipPrimitive.TooltipContent>
            </TooltipPrimitive.Tooltip>
        </TooltipPrimitive.TooltipProvider>
    );
};
