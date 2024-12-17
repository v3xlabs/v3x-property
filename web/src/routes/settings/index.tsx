import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { FaBucket } from 'react-icons/fa6';
import { SiGooglegemini } from 'react-icons/si';
import { SiOllama } from 'react-icons/si';

import { useAuth } from '@/api/auth';
import { BASE_URL } from '@/api/core';
import { getInstanceSettings } from '@/api/instance_settings';
import { useMe } from '@/api/me';
import { SearchTaskTable } from '@/components/search_tasks/SearchTaskTable';
import { BuildDetails } from '@/components/settings/BuildDetails';
import { InstanceSettings } from '@/components/settings/InstanceSettings';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { UserApiKeysTable } from '@/components/user_api_keys/UserApiKeysTable';
import { UserProfile } from '@/components/UserProfile';
import { SCPage } from '@/layouts/SimpleCenterPage';
import { queryClient } from '@/util/query';

export const Route = createFileRoute('/settings/')({
    loader: async () => {
        await queryClient.ensureQueryData(getInstanceSettings());
    },
    component: () => {
        const { token, clearAuthToken } = useAuth();
        const { data: instanceSettings } = useSuspenseQuery(
            getInstanceSettings()
        );
        const { mutate: indexAllItems } = useMutation({
            mutationFn: async () => {
                const response = await fetch(BASE_URL + 'search/reindex', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                return response.json();
            },
        });
        const { data: meData } = useMe();

        return (
            <SCPage title="Settings">
                {meData && (
                    <div className="card flex justify-between items-center">
                        <UserProfile user_id={meData.user_id} />
                        <Button
                            onClick={() => clearAuthToken()}
                            variant="warning"
                        >
                            Logout
                        </Button>
                    </div>
                )}
                <div className="card flex flex-row gap-2">
                    <Button onClick={() => indexAllItems()}>
                        Index All Items
                    </Button>
                </div>
                <div className="card">
                    <InstanceSettings />
                </div>
                {instanceSettings.modules.intelligence && (
                    <div className="card space-y-2">
                        <h2 className="font-bold">Intelligence</h2>
                        <div className="flex gap-2">
                            {instanceSettings.modules.intelligence?.gemini && (
                                <div className="card no-padding p-2 w-fit">
                                    <div className="font-bold flex items-center gap-2">
                                        <SiGooglegemini />
                                        Gemini
                                        <Tooltip>
                                            <div className="space-y-2 pt-2">
                                                <div className="flex items-center gap-2">
                                                    <SiGooglegemini />
                                                    <span>Gemini</span>
                                                </div>
                                                <p>
                                                    Gemini is a large language
                                                    model.
                                                </p>
                                                <p className="text-sm text-neutral-500">
                                                    You can enable gemini by
                                                    setting the{' '}
                                                    <code className="code">
                                                        GEMINI_API_KEY
                                                    </code>{' '}
                                                    via environment variables.
                                                </p>
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                            )}
                            {instanceSettings.modules.intelligence?.ollama && (
                                <div className="card no-padding p-2 w-fit">
                                    <div className="font-bold flex items-center gap-2">
                                        <SiOllama />
                                        Ollama
                                        <Tooltip>
                                            <div className="space-y-2 pt-2">
                                                <div className="flex items-center gap-2">
                                                    <SiOllama />
                                                    <span>Ollama</span>
                                                </div>
                                                <p>
                                                    Ollama is a large language
                                                    model.
                                                </p>
                                                <p className="text-sm text-neutral-500 font-normal">
                                                    You can enable ollama by
                                                    setting the{' '}
                                                    <code className="code">
                                                        OLLAMA_API_KEY
                                                    </code>{' '}
                                                    via environment variables.
                                                </p>
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {instanceSettings.modules.storage && (
                    <div className="card flex flex-col justify-between md:flex-row gap-2">
                        <div>
                            <h2 className="font-bold">Storage</h2>
                            <ul>
                                {(
                                    [
                                        [
                                            'Endpoint',
                                            instanceSettings.modules.storage
                                                .endpoint_url,
                                            undefined,
                                        ],
                                        [
                                            'Bucket',
                                            instanceSettings.modules.storage
                                                .bucket,
                                            <FaBucket />,
                                        ],
                                    ] as const
                                ).map(([key, value, icon]) => (
                                    <li key={key} className="gap-2 flex">
                                        <span className="font-bold">{key}</span>
                                        <span className="flex items-center gap-0.5">
                                            {icon}
                                            <span>{value}</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="md:max-w-md text-sm w-fit text-end text-neutral-500">
                            To setup storage you need to specify{' '}
                            <code>S3_ENDPOINT_URL</code>,{' '}
                            <code>S3_BUCKET_NAME</code>,{' '}
                            <code>S3_ACCESS_KEY</code>, and{' '}
                            <code>S3_SECRET_KEY</code>
                        </div>
                    </div>
                )}{' '}
                <BuildDetails />
                <div className="card">
                    <SearchTaskTable />
                </div>
                <div className="card">
                    <UserApiKeysTable />
                </div>
            </SCPage>
        );
    },
});
