import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { match } from 'ts-pattern';

import { ApiLogResponse, useItemLogs } from '@/api/item';
import { UserProfile } from '@/components/UserProfile';

export type ApiLogEntry = ApiLogResponse[number];

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

const ItemLogEntry = ({ log }: { log: ApiLogEntry }) => {
    const created_ago = timeAgo.format(new Date(log.created_at));

    return (
        <li className="block pt-2 first:pt-0">
            <div className="flex items-center gap-2">
                {match({ action: log.action })
                    .with({ action: 'create' }, () => (
                        <>
                            <span>Created by</span>
                            <UserProfile
                                user_id={log.user_id.toString()}
                                variant="compact"
                            />
                        </>
                    ))
                    .with({ action: 'edit' }, () => (
                        <>
                            <span>Edited by</span>
                            <UserProfile
                                user_id={log.user_id.toString()}
                                variant="compact"
                            />
                        </>
                    ))
                    .otherwise(() => log.action)}
            </div>
            <div className="text-sm text-gray-500">{created_ago}</div>
            {!['create', 'edit'].includes(log.action) && (
                <div>
                    <UserProfile user_id={log.user_id.toString()} />
                </div>
            )}
        </li>
    );
};

export const ItemLogSection = ({ item_id }: { item_id: string }) => {
    const { data: logs } = useItemLogs(item_id);

    return (
        <div>
            <h2 className="h2">Logs</h2>
            <div className="card">
                <ul className="divide-y divide-neutral-200 space-y-2">
                    {logs?.map((log) => (
                        <ItemLogEntry key={log.log_id} log={log} />
                    ))}
                </ul>
            </div>
        </div>
    );
};
