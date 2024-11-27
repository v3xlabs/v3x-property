import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProperties {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<
    ErrorBoundaryProperties,
    ErrorBoundaryState
> {
    constructor(properties: ErrorBoundaryProperties) {
        super(properties);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 border-red-500 border-2 rounded-md bg-red-100 h-full">
                    <p className="font-bold">STL Preview Error</p>
                    <p>Error loading STL file:</p>
                    <code>{this.state.error?.message}</code>
                </div>
            );
        }

        return this.props.children;
    }
}

export { ErrorBoundary };
