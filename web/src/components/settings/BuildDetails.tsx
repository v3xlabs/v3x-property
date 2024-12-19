import { match } from 'ts-pattern';

import {
    useInstanceSettings,
    useInstanceVersion,
} from '@/api/instance_settings';

export const BuildDetails = () => {
    const { data: instanceSettings } = useInstanceSettings();
    const { data: instanceVersion } = useInstanceVersion();

    const github_link =
        instanceSettings &&
        'https://github.com/v3xlabs/v3x-property/commit/' +
            instanceSettings.build_info.git_hash;

    const isAlpha = instanceSettings?.build_info.version.includes('alpha');
    const update_available = instanceVersion?.update_available;

    return (
        <div className="card space-y-2">
            {match({
                update_available,
                isAlpha,
            })
                .with(
                    {
                        update_available: true,
                        isAlpha: false,
                    },
                    () => (
                        <div className="card bg-yellow-100">
                            <div className="font-bold">Update available</div>
                            <div className="">
                                You are running{' '}
                                <code className="code border border-yellow-500 rounded-md !bg-yellow-50">
                                    {instanceVersion?.version}
                                </code>{' '}
                                but{' '}
                                <code className="code border border-yellow-500 rounded-md !bg-yellow-50">
                                    {instanceVersion?.latest}
                                </code>{' '}
                                is available!
                            </div>
                        </div>
                    )
                )
                .with(
                    {
                        isAlpha: true,
                    },
                    () => (
                        <div className="bg-yellow-100/50 p-2 px-3 border border-yellow-500 rounded-md">
                            <div>You're running an alpha build</div>
                        </div>
                    )
                )
                .with(
                    {
                        update_available: false,
                        isAlpha: false,
                    },
                    () => (
                        <div className="bg-green-100/50 p-2 px-3 border border-green-500 rounded-md">
                            <div>You are on the latest</div>
                        </div>
                    )
                )
                .otherwise(() => (
                    <></>
                ))}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                    <a href={github_link} className="link" target="_blank">
                        <span>v3xlabs/v3x-property/engine@</span>
                        <span>sha-{instanceSettings?.build_info.git_hash}</span>
                    </a>
                </div>
                <div className="gap-2 flex flex-row">
                    <span>Running on</span>
                    <span>{instanceSettings?.build_info.target}</span>
                </div>
                <div className="gap-2 flex flex-row">
                    <span>Version</span>
                    <span>v{instanceSettings?.build_info.version}</span>
                </div>
                <div className="gap-2 flex flex-row">
                    <span>Timestamp</span>
                    <span>{instanceSettings?.build_info.timestamp}</span>
                </div>
            </div>
        </div>
    );
};
