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

    return (
        <div className="space-y-2">
            <h2 className="h2">Build Details</h2>
            <div className="card space-y-2">
                {instanceVersion?.update_available ? (
                    <div className="card bg-primary-foreground">
                        <div className="font-bold">Update available</div>
                        <div className="">
                            You are running{' '}
                            <code className="code">
                                {instanceVersion?.version}
                            </code>{' '}
                            but{' '}
                            <code className="code">
                                {instanceVersion?.latest}
                            </code>{' '}
                            is available!
                        </div>
                    </div>
                ) : (
                    <div>You are on the latest</div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                        <a href={github_link} className="link" target="_blank">
                            <span>v3xlabs/v3x-property/engine@</span>
                            <span>
                                sha-{instanceSettings?.build_info.git_hash}
                            </span>
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
        </div>
    );
};
