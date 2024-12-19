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
        // eslint-disable-next-line unicorn/no-null
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
                <div className="h-full rounded-md border-2 border-red-500 bg-red-100 p-4">
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
