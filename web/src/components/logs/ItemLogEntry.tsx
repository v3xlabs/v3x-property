import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { match } from 'ts-pattern';

import { ApiLogResponse } from '@/api/item';
import { UserProfile } from '@/components/UserProfile';

import { ItemPreview } from '../item/ItemPreview';

export type ApiLogEntry = ApiLogResponse[number];

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

export const ItemLogEntry = ({
    log,
    view = 'global',
}: {
    log: ApiLogEntry;
    view?: 'global' | 'local';
}) => {
    const created_ago = timeAgo.format(new Date(log.created_at));
    const log_data = JSON.parse(log.data);

    return (
        <li className="block pt-2 first:pt-0">
            <div className="flex flex-row-reverse justify-between">
                <div>
                    {view === 'global' && (
                        <ItemPreview
                            item_id={log.resource_id}
                            variant="compact"
                        />
                    )}
                </div>
                <div className="flex flex-col w-full gap-2">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            {match({ action: log.action })
                                .with({ action: 'create' }, () => (
                                    <>
                                        <span>Created by</span>
                                        <UserProfile
                                            user_id={log.user_id}
                                            variant="compact"
                                        />
                                    </>
                                ))
                                .with({ action: 'edit' }, () => (
                                    <>
                                        <span>Edited by</span>
                                        <UserProfile
                                            user_id={log.user_id}
                                            variant="compact"
                                        />
                                    </>
                                ))
                                .otherwise(() => log.action)}
                        </div>
                        <div className="text-sm text-gray-500">
                            {created_ago}
                        </div>
                    </div>
                    {match({ action: log.action })
                        .with({ action: 'edit' }, () => (
                            <div className="card no-padding p-2 w-full">
                                <ul>
                                    {Object.entries(log_data)
                                        .filter(
                                            ([_, b]) =>
                                                (Array.isArray(b) &&
                                                    b.length > 0) ||
                                                (!Array.isArray(b) &&
                                                    b != undefined)
                                        )
                                        .map(([key, value], index) => (
                                            <li key={key} className="space-x-2">
                                                <span className="font-bold">
                                                    {key}
                                                </span>
                                                <span>{value as any}</span>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        ))
                        .otherwise(() => (
                            <></>
                        ))}
                </div>
            </div>
            {!['create', 'edit'].includes(log.action) && (
                <div>
                    <UserProfile user_id={log.user_id} />
                </div>
            )}
        </li>
    );
};
