import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useEffect } from 'react';
import { FiLoader } from 'react-icons/fi';

import { useAuth } from '../../api/auth';
import { BASE_URL } from '../../api/core';
import { SearchTask, useTasks } from '../../api/searchtasks';

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

const TaskTableEntry = ({
    task,
    update,
}: {
    task: SearchTask;
    update: () => void;
}) => {
    const { token } = useAuth();
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            // /api/search/tasks/{id} PUT
            const response = await fetch(
                // TODO: migrate to use task_id
                BASE_URL + `/api/search/tasks/${task.external_task_id}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            update();

            return response.json();
        },
    });

    const statusClass = {
        succeeded: 'text-green-500',
        failed: 'text-red-500',
        pending: 'text-gray-500',
    }[task.status.toLowerCase()];

    useEffect(() => {
        if (task.status.toLowerCase() === 'enqueued') {
            mutate();
        }
    }, [task.status]);

    return (
        <tr key={task.task_id} className="w-full border-b border-gray-200">
            <td>#{task.task_id}</td>
            <td>meili/{task.external_task_id}</td>
            <td className={clsx('py-0.5')}>
                <div className="flex items-center gap-2">
                    <div className={clsx(statusClass)}>{task.status}</div>
                    <div>
                        {isPending && <FiLoader className="animate-spin" />}
                    </div>
                </div>
            </td>
            <td className="py-0.5 text-right flex items-center gap-2 justify-end">
                <div className="text-sm text-gray-500">
                    last updated {timeAgo.format(Date.parse(task.updated_at))}
                </div>
                <button className="btn" onClick={() => mutate()}>
                    Refresh
                </button>
            </td>
            {/* {task.details && (
                <>
                    <div>Details</div>
                    <pre className="w-full whitespace-pre-wrap p-4 bg-gray-100 rounded-md">
                        <code>{task.details}</code>
                    </pre>
                </>
            )} */}
        </tr>
    );
};

export const SearchTaskTable = () => {
    const { data, refetch } = useTasks();

    return (
        <div className="w-full">
            <h2>Search Tasks</h2>
            <table className="w-full">
                <tbody className="w-full">
                    {data?.map((task) => (
                        <TaskTableEntry
                            key={task.task_id}
                            task={task}
                            update={refetch}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};
