import { useMutation } from '@tanstack/react-query';

import { apiRequest } from '../core';
import { components } from '../schema.gen';

export type PrintLabelRequest = components['schemas']['PrintRequest'];

export const usePrintLabel = (operator_id: string) => useMutation({
    mutationFn: async (request: PrintLabelRequest) => {
        const response = await apiRequest('/operators/{operator_id}/print', 'post', {
            contentType: 'application/json; charset=utf-8',
            path: {
                operator_id,
            },
            data: request,
        });

        return response.data;
    }
});
