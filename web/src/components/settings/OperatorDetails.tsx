import { useOperators } from '@/api/operators';

export const OperatorDetails = () => {
    const { data: operators } = useOperators();

    return (
        <div className="space-y-2">
            <h2 className="h2">Local Operators</h2>
            <div className="card">
                <div>Hello</div>
                <div>{JSON.stringify(operators)}</div>
            </div>
        </div>
    );
};
