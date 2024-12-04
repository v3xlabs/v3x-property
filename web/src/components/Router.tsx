import { RouteComponent } from '@tanstack/react-router';
import { FaSpinner } from 'react-icons/fa6';

export const defaultPendingComponent: RouteComponent = () => (
    <div className="flex grow items-center justify-center h-full">
        <FaSpinner className="animate-spin size-6" />
    </div>
);
