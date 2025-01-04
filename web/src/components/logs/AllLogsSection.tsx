import { useAllLogs } from '@/api';

import { ItemLogEntry } from './ItemLogEntry';

export const AllLogsSection = () => {
    const { data: logs } = useAllLogs();

    return (
        <ul className="space-y-2">
            {logs?.map((log) => (
                <div className="card">
                    <ItemLogEntry key={log.log_id} log={log} />
                </div>
            ))}
        </ul>
    );
};
