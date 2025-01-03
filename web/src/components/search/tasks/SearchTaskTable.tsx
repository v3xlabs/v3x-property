import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useEffect } from 'react';
import { FiCheck, FiLoader } from 'react-icons/fi';
import { SiMeilisearch } from 'react-icons/si';
import { match } from 'ts-pattern';

import { BASE_URL , SearchTask, useAuth , useTasks } from '@/api';
import { Button } from '@/gui';

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
                BASE_URL + `search/tasks/${task.task_id}`,
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
            <td>
                <div className="flex items-center gap-1">
                    <SiMeilisearch />{task.external_task_id}
                </div>
            </td>
            <td className={clsx('py-0.5')}>
                <div className="flex items-center gap-2">
                    <div className={clsx(statusClass)}>{
                        match(task.status)
                            .with('Succeeded', () =>
                                <><FiCheck /></>
                            )
                            .otherwise(otherwise => otherwise)
                    }</div>
                    <div>
                        {isPending && <FiLoader className="animate-spin" />}
                    </div>
                    {
                        task.label && (
                            <div>
                                {task.label}
                            </div>
                        )
                    }
                </div>
            </td>
            <td className="flex items-center justify-end gap-2 py-0.5 text-right">
                <div className="text-sm text-gray-500">
                    {timeAgo.format(Date.parse(task.updated_at))}
                </div>
                <Button onClick={() => mutate()}>Refresh</Button>
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
            <h3 className="h3">Search Tasks</h3>
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
