import { useAllLogs } from '@/api/logs';

import { ItemLogEntry } from './ItemLogEntry';

export const AllLogsSection = () => {
    const { data: logs } = useAllLogs();

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
