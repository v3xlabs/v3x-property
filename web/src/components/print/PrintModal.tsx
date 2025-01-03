import { FC, useEffect, useState } from 'react';
import { FaQrcode } from 'react-icons/fa6';
import { FiPrinter } from 'react-icons/fi';

import { useItemById, useOperatorCapabilities, useOperators, usePrintLabel } from '@/api';
import {
    Button, Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    FieldOption, FieldSelect,
    Tooltip
} from '@/gui';

const PrintableCableTemplatePreview = () => {
    return (
        <div className="relative h-full w-full bg-neutral-200">
            <div className='absolute left-1/2 top-0 h-fit w-fit -translate-x-1/2 rotate-90 border'>
                <FaQrcode />
                #123
            </div><div className='absolute bottom-0 left-1/2 h-fit w-fit -translate-x-1/2 -rotate-90 border'>
                <FaQrcode />
                #123
            </div>
        </div>
    );
};

const PrintLabelModalContent = () => {
    const { data: operators } = useOperators();
    const { data: capabilities } = useOperatorCapabilities(operators?.[0]?.operator_id);

    const [printer, setPrinter] = useState<string | undefined>(capabilities?.printers?.printers?.[0]?.name);

    useEffect(() => {
        if (capabilities?.printers?.printers?.length) {
            setPrinter(capabilities?.printers?.printers?.[0]?.name);
        }
    }, [capabilities]);

    return (
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
    );
};

export const PrintLabelModal: FC<{ label_id: string }> = ({ label_id }) => {
    const { data: operators } = useOperators();
    const { data: capabilities } = useOperatorCapabilities(operators?.[0]?.operator_id);
    const { data: label } = useItemById(label_id);
    // const { mutate: printLabel } = useMutation({
    //     mutationFn: async () => {
    //         const response = await fetch(`${operators?.[0]?.operator_endpoint}/api/print`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 label_id,
    //                 printer_id: capabilities?.printers?.printers[0]?.name,
    //                 label_template: 'v3x_cable_label_1',
    //                 url: window.location.origin,
    //             }),
    //         });
    //     }
    // });
    const { mutate: printLabel } = usePrintLabel(operators?.[0]?.operator_id ?? '');

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Print Label</DialogTitle>
            </DialogHeader>
            <DialogDescription>
                Print the label for the given label id.
            </DialogDescription>
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="text-sm font-medium">Template</div>
                    <div className="text-sm text-neutral-500">
                        Select the template to print the label.
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="aspect-[9/16] h-32 rounded-sm border outline outline-offset-1 outline-blue-200">
                            <PrintableCableTemplatePreview />
                        </div>
                        <div className="aspect-square w-24 rounded-sm border"></div>
                        <div className="aspect-video w-32 rounded-sm border"></div>
                    </div>
                </div>
                <PrintLabelModalContent />
                <div className="text-sm text-neutral-500">
                    Warning; implementation currently only supports printing one label type from the first printer on the first operator found.
                </div>
            </div>
            <DialogFooter>
                <Button type="submit" variant="primary" onClick={() => printLabel({
                    label_id,
                    printer_id: 'test',
                    label_template: 'v3x_cable_label_1',
                    url: window.location.origin,
                })}>Print</Button>
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
