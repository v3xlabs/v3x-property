import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { match } from 'ts-pattern';

import { ApiLogResponse, ItemLocation } from '@/api/item';
import { UserProfile } from '@/components/UserProfile';

import { ItemPreview } from '../item/ItemPreview';
import { LocationPreview } from '../location/LocationPreview';
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
        <li className="block space-y-2 pt-2 first:pt-0">
            <div className="flex flex-row-reverse justify-between">
                <div>
                    {view === 'global' && (
                        <ItemPreview
                            item_id={log.resource_id}
                            variant="compact"
                        />
                    )}
                    <div className="text-end text-sm text-gray-500">
                        {created_ago}
                    </div>
                </div>
                <div className="flex w-full flex-col gap-2">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            {match({ action: log.action, data: log.data })
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
                                .with({ action: 'update_location' }, () => (
                                    <>
                                        <span>Moved by</span>
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
                .with({ action: 'update_location' }, () => {
                    const itemLocation = JSON.parse(log.data ) as ItemLocation;

                    return (
                        <div>
                            <span>Location</span>
                            <LocationPreview itemLocation={itemLocation} />
                        </div>
                    );
                })
                .otherwise(() => (
                    <></>
                ))}
        </li>
    );
};
