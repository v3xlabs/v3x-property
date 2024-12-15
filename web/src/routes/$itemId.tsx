import { createFileRoute, redirect } from '@tanstack/react-router';

import { formatId, getInstanceSettings } from '@/api/instance_settings';
import { queryClient } from '@/util/query';

export const Route = createFileRoute('/$itemId')({
    component: () => <div>Hello. This page should not be accessible.</div>,
    loader: async ({ context, params }) => {
        if (params.itemId == '' || params.itemId == 'item') {
            return redirect({ to: '/items' });
        }

        const instanceSettings = await queryClient.ensureQueryData(
            getInstanceSettings()
        );
        const formattedItemId = formatId(params.itemId, instanceSettings);

        console.log('redirecting to', formattedItemId);

        return redirect({ to: `/item/${formattedItemId}` });
    },
});
