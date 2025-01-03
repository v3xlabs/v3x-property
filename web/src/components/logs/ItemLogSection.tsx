import { useItemLogs } from '@/api';

import { ItemLogEntry } from './ItemLogEntry';

export const ItemLogSection = ({ item_id }: { item_id: string }) => {
    const { data: logs } = useItemLogs(item_id);

    if (logs?.length === 0) {
        return;
    }

    return (
        <div>
            <h2 className="h2">Logs</h2>
            <div className="card">
                <ul className="space-y-2 divide-y divide-neutral-200">
                    {logs?.map((log) => (
                        <ItemLogEntry key={log.log_id} log={log} view="local" />
                    ))}
                </ul>
            </div>
        </div>
    );
};
