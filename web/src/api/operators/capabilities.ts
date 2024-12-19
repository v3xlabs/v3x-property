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

export const getOperatorCapabilities = (endpoint: string) => queryOptions({
    queryKey: ['operator', 'capabilities', '{endpoint}', endpoint],
    queryFn: async () => {
        const response = await fetch(`${endpoint}/api/capabilities`);

        return await response.json() as OperatorCapabilities;
    },
});

export const useOperatorCapabilities = (endpoint: string) => useQuery(getOperatorCapabilities(endpoint));
