import clsx from 'clsx';
import { FaBrain } from 'react-icons/fa6';
import { SiGooglegemini, SiOpenai } from 'react-icons/si';
import { SiOllama } from 'react-icons/si';

import { useInstanceSettings } from '@/api/instance_settings';

import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';

const INTELLIGENCE_DATA = {
    gemini: {
        name: 'Gemini',
        icon: <SiGooglegemini />,
        description: 'Gemini is a large language model.',
        tooltip: (
            <p className="text-sm text-neutral-500">
                You can enable gemini by setting the{' '}
                <code className="code">GEMINI_API_KEY</code> via environment
                variables.
            </p>
        ),
    },
    openai: {
        name: 'OpenAI',
        icon: <SiOpenai />,
        description: 'OpenAI is an LLM server.',
        tooltip: (
            <p className="text-sm text-neutral-500">
                You can enable openai by setting the{' '}
                <code className="code">OPENAI_API_KEY</code> via environment
                variables.
            </p>
        ),
    },
    ollama: {
        name: 'Ollama',
        icon: <SiOllama />,
        description: 'Ollama is an LLM server.',
        tooltip: (
            <p className="text-sm text-neutral-500">
                You can enable ollama by setting the{' '}
                <code className="code">OLLAMA_API_KEY</code> via environment
                variables.
            </p>
        ),
    },
};

export const IntelligenceDetails = () => {
    const { data: instanceSettings } = useInstanceSettings();

    return (
        <>
            {
                !instanceSettings?.modules.intelligence && (
                    <div className="card space-y-3">
                        <div className="flex items-center gap-2">
                            <FaBrain />
                            <h3 className="font-bold">No intelligence modules found</h3>
                        </div>
                        <p>
                            You can use intelligence features by enabling one of the{' '}
                            <a href="https://github.com/v3xlabs/v3x-property/tree/master/engine#enable-intelligence" target="_blank" className="link">intelligence modules</a>.
                        </p>
                    </div>
                )
            }
            {instanceSettings?.modules.intelligence && (
                <>
                    <div className="card space-y-3">
                        <div className="flex items-center gap-2">
                            <FaBrain />
                            <h3 className="font-bold">Intelligence is active</h3>
                        </div>
                        <p>
                    Intelligence is active. You can use the intelligence
                    features of the application.
                        </p>
                        <div className="flex items-center gap-2">
                            <Button variant="primary">Configure Preferences</Button>
                            <Button variant="secondary">Capabilities</Button>
                        </div>
                    </div>
                    <h3 className="h3">Intelligence Endpoints</h3>
                    <div className="card no-padding flex flex-col divide-y divide-neutral-200">
                        {Object.entries(INTELLIGENCE_DATA)
                            // Sort based on enabled
                            .sort((a, b) =>
                                !!instanceSettings?.modules?.intelligence?.[
                                    a[0] as keyof typeof instanceSettings.modules.intelligence
                                ] >
                                !!instanceSettings?.modules?.intelligence?.[
                                    b[0] as keyof typeof instanceSettings.modules.intelligence
                                ]
                                    ? -1
                                    : 1
                            )
                            // Map to components
                            .map(([key, value]) => {
                                if (!instanceSettings?.modules.intelligence) {
                                    return;
                                }

                                const data =
                                    instanceSettings.modules.intelligence[
                                        key as keyof typeof instanceSettings.modules.intelligence
                                    ];

                                const isEnabled = !!data;

                                return (
                                    <div className="w-full p-4">
                                        <div
                                            className={clsx(
                                                'flex items-center gap-2 font-bold',
                                                !isEnabled && 'text-neutral-400'
                                            )}
                                        >
                                            {value.icon}
                                            {value.name}
                                            <Tooltip>
                                                <div className="space-y-4 pt-2">
                                                    <div className="flex items-center gap-2">
                                                        {value.icon}
                                                        <span>
                                                            {value.name}
                                                        </span>
                                                    </div>
                                                    <p>{value.description}</p>
                                                    {value.tooltip}
                                                </div>
                                            </Tooltip>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </>
            )}
        </>
    );
};
