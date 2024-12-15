import { FC, useEffect, useRef } from 'react';
import { FiLoader } from 'react-icons/fi';
import { SiGooglegemini } from 'react-icons/si';
import { TbFunctionFilled } from 'react-icons/tb';
import { TfiReload } from 'react-icons/tfi';
import { match } from 'ts-pattern';

import { Button, ButtonProperties } from '../ui/Button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../ui/Dialog';
import { PopoverContent } from '../ui/Popover';

export type AgentEvent = {
    event: string;
    data: any;
};

// strip ```json and ``` from start and end of string, also remove trailing newlines or spaces
export const attemptExtractMdJson = (text: string) => {
    const match = text
        .trim()
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '')
        .replace(/```/, '');

    const result = match.trim();

    try {
        return JSON.parse(result ?? '');
    } catch {
        return result;
    }
};

export const ExpandableTextModal: FC<{
    text: string | object;
    label: string;
    variant?: ButtonProperties['variant'];
    buttonWidth?: string;
}> = ({ text, label, variant = 'default', buttonWidth = 'w-fit' }) => {
    return (
        <Dialog>
            <div className={buttonWidth}>
                <DialogTrigger asChild>
                    <Button
                        variant={variant}
                        size="sm"
                        style={{ width: '100%' }}
                    >
                        {label}
                    </Button>
                </DialogTrigger>
            </div>
            <DialogContent className="max-h-[800px] w-full">
                <DialogHeader>
                    <DialogTitle>Output</DialogTitle>
                    <DialogDescription>
                        This is what the agent has output
                    </DialogDescription>
                </DialogHeader>
                <div className="w-full overflow-x-hidden">
                    <div className="max-h-[500px] max-w-full w-full">
                        <pre className="pre border text-wrap p-0.5 overflow-y-auto overflow-x-auto w-full max-w-full">
                            {text instanceof Object
                                ? JSON.stringify(text, undefined, 2)
                                : text}
                        </pre>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const AgentDecoder: FC<{
    conversation?: string[];
    onReThinkSteps?: () => void;
}> = ({ conversation, onReThinkSteps }) => {
    const lastReference = useRef<HTMLLIElement>(null);

    useEffect(() => {
        if (lastReference.current) {
            console.log('SCROLLING', lastReference.current);
            lastReference.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [lastReference, conversation]);

    return (
        <PopoverContent className="max-h-[60vh] overflow-y-auto">
            <ul className="">
                {conversation?.map((entry, index, total) => {
                    const isLast = index === total.length - 1;
                    const message: AgentEvent = JSON.parse(entry);

                    return (
                        <li
                            key={index}
                            ref={isLast ? lastReference : undefined}
                        >
                            {match(message)
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
                                            <>
                                                <div className="py-4 px-2 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <TbFunctionFilled />
                                                        <div>
                                                            {functionCall}
                                                        </div>
                                                    </div>
                                                    <pre className="pre text-wrap p-0.5 break-words">
                                                        {query}
                                                    </pre>
                                                </div>
                                                {isLast && (
                                                    <div className="flex items-center justify-center">
                                                        <FiLoader className="animate-spin" />
                                                    </div>
                                                )}
                                            </>
                                        );
                                    }
                                )
                                .with(
                                    {
                                        event: 'function_response',
                                    },
                                    () => {
                                        const text =
                                            message.data.parts[0].type == 'text'
                                                ? message.data.parts[0].content
                                                : JSON.stringify(
                                                      message.data.parts[0]
                                                          .content[1],
                                                      undefined,
                                                      2
                                                  );

                                        return (
                                            <div
                                                className={'py-4 px-2 border-b'}
                                            >
                                                <ExpandableTextModal
                                                    text={text}
                                                    label="Function Response"
                                                    variant={
                                                        message.data.parts[0]
                                                            .type == 'text'
                                                            ? 'warning'
                                                            : 'default'
                                                    }
                                                />
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
                                    () => {
                                        const text =
                                            message.data.parts[0].content;
                                        const attemptedExtraction =
                                            attemptExtractMdJson(text);

                                        // const x =
                                        // JSON.parse(attemptedExtraction)['name'];

                                        // const name =
                                        const name = undefined;
                                        //     JSON.parse(attemptedExtraction)['name'];

                                        return (
                                            <div className="flex items-center justify-center p-0.5 py-1 my-2">
                                                <ExpandableTextModal
                                                    text={attemptedExtraction}
                                                    label={name ?? '📄 Results'}
                                                    buttonWidth="w-full"
                                                    // label={x}
                                                />
                                            </div>
                                        );
                                    }
                                )
                                .with(
                                    {
                                        event: 'conversation_complete',
                                    },
                                    () => {
                                        return (
                                            <div className="pt-2">
                                                <div className="flex items-center justify-stretch py-0.5 gap-0.5">
                                                    <div className="grow h-0.5 bg-border w-full"></div>
                                                    <div className="italic text-center break-inside-avoid text-nowrap">
                                                        Intelligence Complete
                                                    </div>
                                                    <div className="grow h-0.5 bg-border w-full"></div>
                                                </div>
                                                {onReThinkSteps && (
                                                    <div className="mx-auto w-full flex justify-center">
                                                        <Button
                                                            variant="ghost"
                                                            onClick={
                                                                onReThinkSteps
                                                            }
                                                        >
                                                            <TfiReload />
                                                            <span>
                                                                Re-think steps
                                                            </span>
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }
                                )
                                .otherwise(() => (
                                    <div className="py-4 px-2">
                                        <div>Unknown Output</div>
                                        <pre>
                                            {JSON.stringify(
                                                message,
                                                undefined,
                                                2
                                            )}
                                        </pre>
                                    </div>
                                ))}
                        </li>
                    );
                })}
            </ul>
        </PopoverContent>
    );
};
