import { FC } from 'react';
import { LuFunctionSquare } from 'react-icons/lu';
import { SiGooglegemini } from 'react-icons/si';
import { match } from 'ts-pattern';

import { PopoverContent } from '../ui/Popover';

export type AgentEvent = {
    event: string;
    data: any;
};

export const AgentDecoder: FC<{ conversation?: string[] }> = ({
    conversation,
}) => {
    return (
        <PopoverContent>
            <ul className="divide-y">
                {conversation?.map((entry) => {
                    const message: AgentEvent = JSON.parse(entry);

                    return match(message)
                        .with(
                            {
                                event: 'hello',
                            },
                            () => (
                                <div className="py-4 px-2 flex gap-2 items-center">
                                    Chatting with <b>Gemini</b>{' '}
                                    <SiGooglegemini />
                                </div>
                            )
                        )
                        .with(
                            {
                                event: 'conversation_message',
                                data: {
                                    parts: [{ type: 'function_call' }],
                                },
                            },
                            () => {
                                const [functionCall, query] =
                                    message.data.parts[0].content;

                                return (
                                    <div className="py-4 px-2 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <LuFunctionSquare />
                                            <div>{functionCall}</div>
                                        </div>
                                        <pre className="pre text-wrap p-0.5">
                                            {query}
                                        </pre>
                                    </div>
                                );
                            }
                        )
                        .with(
                            {
                                event: 'conversation_message',
                                data: {
                                    parts: [{ type: 'text' }],
                                },
                            },
                            () => (
                                <div className="py-4 px-2">
                                    {message.data.parts[0].content ||
                                        'No Output, request failed'}
                                </div>
                            )
                        )
                        .otherwise(() => (
                            <div className="py-4 px-2">
                                <div>Unknown Output</div>
                                <pre>
                                    {JSON.stringify(message, undefined, 2)}
                                </pre>
                            </div>
                        ));
                })}
            </ul>
        </PopoverContent>
    );
};
