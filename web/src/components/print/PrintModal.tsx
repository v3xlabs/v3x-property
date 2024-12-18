import { FC } from 'react';
import { FiPrinter } from 'react-icons/fi';

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

export const PrintLabelModal: FC<{ label_id: string }> = ({ label_id }) => {
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Print Label</DialogTitle>
            </DialogHeader>
            <DialogDescription>
                Print the label for the given label id.
            </DialogDescription>
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
