import { FC, useEffect, useRef } from 'react';
import { RxPaperPlane } from 'react-icons/rx';
import { SiGooglegemini } from 'react-icons/si';
import { TbFunctionFilled } from 'react-icons/tb';
import { TfiReload } from 'react-icons/tfi';
import { match } from 'ts-pattern';

import { Button, ButtonProperties } from '../../gui/Button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../gui/dialog/Dialog';
import { PopoverContent } from '../../gui/Popover';

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
                    <div className="max-h-[500px] w-full max-w-full">
                        <pre className="pre w-full max-w-full overflow-x-auto overflow-y-auto text-wrap border p-0.5">
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
                                        <div className="flex items-center gap-2 px-2 py-4">
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
                                                <div className="space-y-2 px-2 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <TbFunctionFilled />
                                                        <div>
                                                            {functionCall}
                                                        </div>
                                                    </div>
                                                    <pre className="pre text-wrap break-words p-0.5">
                                                        {query}
                                                    </pre>
                                                </div>
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
                                                className={'border-b px-2 py-4'}
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
                                            <div className="my-2 flex items-center justify-center p-0.5 py-1">
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
                                                <div className="flex items-center justify-stretch gap-0.5 py-0.5">
                                                    <div className="h-0.5 w-full grow bg-border"></div>
                                                    <div className="break-inside-avoid text-nowrap text-center italic">
                                                        Intelligence Complete
                                                    </div>
                                                    <div className="h-0.5 w-full grow bg-border"></div>
                                                </div>
                                                {onReThinkSteps && (
                                                    <div className="mx-auto flex w-full justify-center">
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
                                    <div className="px-2 py-4">
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

                            {isLast &&
                                match({
                                    type: message.data?.parts?.[0]?.type,
                                })
                                    .with(
                                        { type: 'function_call' },
                                        { type: 'function_response' },
                                        () => (
                                            <div className="mt-2 flex items-center justify-center gap-2 pt-1">
                                                <RxPaperPlane />
                                                <div className="text-sm">
                                                    Generating
                                                    <span className="loading-dots">
                                                        <span>.</span>
                                                        <span>.</span>
                                                        <span>.</span>
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    )
                                    .otherwise(() => <></>)}
                        </li>
                    );
                })}
            </ul>
        </PopoverContent>
    );
};
