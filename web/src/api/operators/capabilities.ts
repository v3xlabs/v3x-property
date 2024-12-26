import { queryOptions, useQuery } from '@tanstack/react-query';

import { apiRequest } from '../core';

export const getOperatorCapabilities = (operator_id?: string) => queryOptions({
    queryKey: ['operator', 'capabilities', operator_id],
    queryFn: async () => {
        if (!operator_id) {
            return;
        }

        const response = await apiRequest('/operators/{operator_id}/capabilities', 'get', {
            path: {
                operator_id,
            },
        });

        return response.data;
    },
    enabled: !!operator_id,
});

export const useOperatorCapabilities = (operator_id?: string) => useQuery(getOperatorCapabilities(operator_id));
