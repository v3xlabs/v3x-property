import prettyBytes from 'pretty-bytes';
import { FaBucket } from 'react-icons/fa6';

import {
    useInstanceSettings,
    useInstanceStorageStatistics,
} from '@/api/instance_settings';

export const StorageDetails = () => {
    const { data: instanceSettings } = useInstanceSettings();
    const { data: storageStatistics } = useInstanceStorageStatistics();

    if (!instanceSettings?.modules.storage) {
        return;
    }

    return (
        <div className="space-y-2">
            <h2 className="h2">Storage</h2>
            <div className="card flex flex-col justify-between md:flex-row gap-4">
                <div className="w-full space-y-2">
                    <h2 className="font-bold">S3-Compatible Object Storage</h2>
                    <p>Somethin gosmethin</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(
                            [
                                [
                                    'Storage Used',
                                    prettyBytes(
                                        storageStatistics?.bucket_disk_size ?? 0
                                    ),
                                ],
                                [
                                    'Files',
                                    storageStatistics?.bucket_file_count ?? 0,
                                ],
                                [
                                    'Endpoint',
                                    instanceSettings.modules.storage
                                        .endpoint_url,
                                    undefined,
                                ],
                                [
                                    'Bucket',
                                    instanceSettings.modules.storage.bucket,
                                    <FaBucket />,
                                ],
                            ] as const
                        ).map(([key, value, icon]) => (
                            <li key={key} className="gap-2 flex flex-col">
                                <span className="font-bold">{key}</span>
                                <span className="flex items-center gap-0.5">
                                    {icon}
                                    <span>{value}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* <div className="md:max-w-md text-sm w-fit text-end text-neutral-500">
                    To setup storage you need to specify{' '}
                    <code>S3_ENDPOINT_URL</code>, <code>S3_BUCKET_NAME</code>,{' '}
                    <code>S3_ACCESS_KEY</code>, and <code>S3_SECRET_KEY</code>
                </div> */}
            </div>
        </div>
    );
};
