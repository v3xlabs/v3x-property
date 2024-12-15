import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { match } from 'ts-pattern';

import { ApiLogResponse } from '@/api/item';
import { UserProfile } from '@/components/UserProfile';

import { ItemPreview } from '../item/ItemPreview';
import { ItemEditLogData } from './data/ItemEditLogData';

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

    return (
        <li className="block pt-2 first:pt-0 space-y-2">
            <div className="flex flex-row-reverse justify-between">
                <div>
                    {view === 'global' && (
                        <ItemPreview
                            item_id={log.resource_id}
                            variant="compact"
                        />
                    )}
                    <div className="text-sm text-gray-500 text-end">
                        {created_ago}
                    </div>
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
                    </div>
                </div>
            </div>
            {match({ action: log.action })
                .with({ action: 'edit' }, () => <ItemEditLogData log={log} />)
                .otherwise(() => (
                    <></>
                ))}
        </li>
    );
};
