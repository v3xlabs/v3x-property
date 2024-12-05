import { createFileRoute, redirect } from '@tanstack/react-router';

import {
    formatId,
    instanceSettingsQueryOptions,
} from '@/api/instance_settings';
import { queryClient } from '@/util/query';

export const Route = createFileRoute('/$itemId')({
    component: () => <div>Hello /$itemId!</div>,
    loader: async ({ context, params }) => {
        const instanceSettings = await queryClient.ensureQueryData(
            instanceSettingsQueryOptions
        );
        const formattedItemId = formatId(params.itemId, instanceSettings);

        console.log('redirecting to', formattedItemId);

        return redirect({ to: `/item/${formattedItemId}` });
    },
});
