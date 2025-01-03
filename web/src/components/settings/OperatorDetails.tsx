import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { FC } from 'react';
import { FaRecycle, FaSink, FaTruckMonster } from 'react-icons/fa6';
import { match } from 'ts-pattern';

import { Operator, useOperatorCapabilities, useOperators } from '@/api';

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

export type KnownMarkerTypes = 'ink-cartridge' | 'waste-ink' | 'toner' | 'opc'

const parseNarrowArray = (value: string) => {
    if (!value) {
        return [];
    }

    return value.slice(1, -1).split(',').map((item) => item.trim());
};

export const TonerInfo: FC<{ markerChangeTime: string, markerColors: string, markerLevels: string, markerNames: string, markerTypes: string }> = ({ markerChangeTime, markerColors, markerLevels, markerNames, markerTypes }) => {
    const markerName = parseNarrowArray(markerNames);
    const markerColor = parseNarrowArray(markerColors);
    const markerLevel = parseNarrowArray(markerLevels).map((l) => {
        const level = Number.parseInt(l);

        if (level == -1) {
            return 100;
        }

        if (level > 100) {
            return 100;
        }

        if (level < 0) {
            return 0;
        }

        return level;
    });
    const markerType = parseNarrowArray(markerTypes) as (KnownMarkerTypes & string)[];

    return <div className="rounded-md border p-2">
        <ul className="flex gap-2">
            {
                markerName.map((name, index) => (
                    <div key={name} className="w-fit space-y-2">
                        {
                            match(markerType[index])
                                .with('ink-cartridge', () => <FaSink />)
                                .with('waste-ink', () => <FaRecycle />)
                                .with('toner', () => <FaTruckMonster />)
                                .with('opc', () => <span>Opc</span>)
                                .exhaustive()
                        }
                        <div className="flex h-12 w-4 items-end rounded-sm border bg-white p-0.5">
                            <div className="w-full bg-black" style={{ height: `${markerLevel[index]}%`, backgroundColor: markerColor[index] }}></div>
                        </div>
                        <span>
                            {name}
                        </span>
                    </div>
                ))
            }
        </ul>
        <div className="text-end text-neutral-600">
            Last updated:{' '}
            {timeAgo.format(new Date(Number.parseInt(markerChangeTime) * 1000))}
        </div>
    </div>;
};

export const OperatorDetail: FC<{ operator: Operator }> = ({ operator }) => {
    const { data: capabilities } = useOperatorCapabilities(operator.operator_id);

    return <li key={operator.operator_id} className="space-y-2">
        <div className="font-bold">
            Endpoint
        </div>
        <div>{operator.operator_endpoint}</div>
        <div className="font-bold">
            Operator Id
        </div>
        <div>{operator.operator_id}</div>
        <div>
            <ul className="space-y-2">
                {capabilities?.printers.printers.map((printer) => (
                    <li key={printer.name} className="card flex">
                        {printer.metadata['printer-icons'] && (
                            <div className="size-16 bg-white">
                                <img src={printer.metadata['printer-icons']} alt="Printer Icon" className="size-full object-contain" />
                            </div>
                        )}
                        <div className="flex w-full flex-col">
                            <div className="font-bold">{printer.name}</div>
                            <div>
                                {printer.metadata['printer-name']}
                                {printer.metadata['printer-info']}
                            </div>
                            {
                                printer.metadata['marker-levels'] && (
                                    <TonerInfo
                                        markerChangeTime={printer.metadata['marker-change-time']}
                                        markerColors={printer.metadata['marker-colors']}
                                        markerLevels={printer.metadata['marker-levels']}
                                        markerNames={printer.metadata['marker-names']}
                                        markerTypes={printer.metadata['marker-types']}
                                    />
                                )
                            }
                            <div className="px-2 py-1 text-end">
                                {/* {printer.metadata['media-supported']} */}
                                <span>
                                    Queued Jobs:{' '}
                                </span>
                                {printer.metadata['queued-job-count']}
                            </div>
                        </div>
                        <div className="hidden space-y-1">
                            {Object.entries(printer.metadata).map(([key, value]) => (
                                <div key={key}>
                                    <span className="underline">{key}</span>: {value}
                                </div>
                            ))}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    </li>;
};

export const OperatorDetails = () => {
    const { data: operators } = useOperators();

    return (
        <div className="space-y-2">
            <h2 className="h2">Local Operators</h2>
            <div className="card space-y-2">
                <ul>
                    {
                        operators?.map((operator) => (
                            <OperatorDetail
                                key={operator.operator_id}
                                operator={operator}
                            />
                        ))
                    }
                </ul>
            </div>
        </div>
    );
};
