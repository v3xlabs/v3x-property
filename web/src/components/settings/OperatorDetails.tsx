import { FC } from 'react';

import { Operator, useOperators } from '@/api/operators';
import { useOperatorCapabilities } from '@/api/operators/capabilities';

export const OperatorDetail: FC<{ operator: Operator }> = ({ operator }) => {
    const { data: capabilities } = useOperatorCapabilities(operator.operator_endpoint);

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
            <ul>
                {capabilities?.printers.printers.map((printer) => (
                    <li key={printer.name} className="card">
                        <div className="font-bold">{printer.name}</div>
                        <div className="space-y-1">
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
