import { useMutation } from '@tanstack/react-query';

import { useAuth } from '../../api/auth';
import { BASE_URL } from '../../api/core';
import { SearchTask, useTasks } from '../../api/searchtasks';

const TaskTableEntry = ({
    task,
    update,
}: {
    task: SearchTask;
    update: () => void;
}) => {
    const { token } = useAuth();
    const { mutate } = useMutation({
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

    return (
        <li key={task.task_id} className="flex items-center gap-2">
            <div>{task.task_id}</div>
            <div>{task.external_task_id}</div>
            <div>{task.status}</div>
            <div>{Date.parse(task.updated_at)}</div>
            <button className="btn" onClick={() => mutate()}>
                Refresh
            </button>
        </li>
    );
};

export const SearchTaskTable = () => {
    const { data, refetch } = useTasks();

    return (
        <div>
            <h2>Search Tasks</h2>
            <ul>
                {data?.map((task) => (
                    <TaskTableEntry
                        key={task.task_id}
                        task={task}
                        update={refetch}
                    />
                ))}
            </ul>
        </div>
    );
};
