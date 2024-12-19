import { FC, useEffect, useState } from 'react';
import { FiPrinter } from 'react-icons/fi';

import { useOperators } from '@/api/operators';
import { useOperatorCapabilities } from '@/api/operators/capabilities';

import { FieldOption, FieldSelect } from '../form/Select';
import { Button } from '../ui/Button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../ui/Dialog';
import { Tooltip } from '../ui/Tooltip';

export const PrintLabelModal: FC<{ label_id: string }> = ({ label_id }) => {
    const { data: operators } = useOperators();
    const { data: capabilities } = useOperatorCapabilities(operators?.[0]?.operator_endpoint);

    const [printer, setPrinter] = useState<string | undefined>(capabilities?.printers?.printers?.[0]?.name);

    useEffect(() => {
        if (capabilities?.printers?.printers?.length) {
            setPrinter(capabilities?.printers?.printers?.[0]?.name);
        }
    }, [capabilities]);

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Print Label</DialogTitle>
            </DialogHeader>
            <DialogDescription>
                Print the label for the given label id.
            </DialogDescription>
            <div>
                <FieldSelect
                    label="Printer"
                    value={printer ?? ''}
                    options={capabilities?.printers?.printers?.map((printer) => ({
                        label: printer.name,
                        value: printer.name,
                    } as FieldOption)) ?? []}
                    onChange={(value) => {
                        setPrinter(value);

                        return true;
                    }}
                    errorMessage={
                        !capabilities?.printers?.printers?.find((p) => p.name)
                            ? 'No printers found'
                            : undefined
                    }
                    description={
                        <>
                            You can connect a printer by running an operator <Tooltip>Operator</Tooltip>

                        </>
                    }
                    justifyBetween
                />
            </div>
            <DialogFooter>
                <Button>Print</Button>
            </DialogFooter>
        </DialogContent>
    );
};

export const PrintLabelButton: FC<{ label_id: string }> = ({ label_id }) => {
    return (
        <Dialog>
            <DialogTrigger>
                <Button size="icon">
                    <FiPrinter />
                </Button>
            </DialogTrigger>
            <PrintLabelModal label_id={label_id} />
        </Dialog>
    );
};
