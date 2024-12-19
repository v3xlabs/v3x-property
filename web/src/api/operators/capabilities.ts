import { queryOptions, useQuery } from '@tanstack/react-query';

export type OperatorCapabilities = {
    printers: PrintersInfo;
};

export type PrintersInfo = {
    printers: PrinterInfo[];
};

export type PrinterInfo = {
    name: string;
    metadata: Record<string, string>;
};

export const getOperatorCapabilities = (endpoint?: string) => queryOptions({
    queryKey: ['operator', 'capabilities', endpoint],
    queryFn: async () => {
        if (!endpoint) {
            return;
        }

        const response = await fetch(`${endpoint}/api/capabilities`);

        return await response.json() as OperatorCapabilities;
    },
    enabled: !!endpoint,
});

export const useOperatorCapabilities = (endpoint?: string) => useQuery(getOperatorCapabilities(endpoint));
