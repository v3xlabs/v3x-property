import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
// import TimeAgo from 'javascript-time-ago';
// import en from 'javascript-time-ago/locale/en';
import { FiLoader } from 'react-icons/fi';

import { useAuth } from '@/api/auth';
import { ApiRequest, BASE_URL } from '@/api/core';
import { useMe } from '@/api/me';
import { useUserPats } from '@/api/user/pat';

import { Button } from '../ui/Button';

// TimeAgo.addDefaultLocale(en);
// const timeAgo = new TimeAgo('en-US');

type UserApiKey = ApiRequest<
    '/user/{user_id}/keys',
    'get'
>['response']['data'][number];

const TokenTableEntry = ({
    apiToken,
    update,
}: {
    apiToken: UserApiKey;
    update: () => void;
}) => {
    const { token } = useAuth();
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            // /api/search/tasks/{id} PUT
            const response = await fetch(
                BASE_URL +
                    `/user/${apiToken.user_id}/keys/${apiToken.token_id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            update();

            return response.json();
        },
    });

    return (
        <tr key={apiToken.token_id} className="w-full border-b border-gray-200">
            <td>#{apiToken.token_id}</td>
            <td>{apiToken.name}</td>
            <td className={clsx('py-0.5')}>
                <div className="flex items-center gap-2">
                    <div>{apiToken.permissions}</div>
                    <div>
                        {isPending && <FiLoader className="animate-spin" />}
                    </div>
                </div>
            </td>
            <td className="py-0.5 text-right flex items-center gap-2 justify-end">
                <div className="text-sm text-gray-500">
                    {/* last updated {timeAgo.format(Date.parse(apiToken.updated_at))} */}
                </div>
                <Button onClick={() => mutate()}>Delete</Button>
            </td>
        </tr>
    );
};

export const UserApiKeysTable = () => {
    const { data: me } = useMe();
    const { data, refetch } = useUserPats(me?.user_id ?? 0);

    return (
        <div className="w-full">
            <h2>Personal Access Tokens</h2>
            {(data || []).length > 0 ? (
                <table className="w-full">
                    <tbody className="w-full">
                        {data?.map((token) => (
                            <TokenTableEntry
                                key={token.token_id}
                                apiToken={token}
                                update={refetch}
                            />
                        ))}
                    </tbody>
                </table>
            ) : (
                <div>It appears you don't have any api keys</div>
            )}
        </div>
    );
};
