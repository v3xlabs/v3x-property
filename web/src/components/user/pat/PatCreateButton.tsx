import { useState } from 'react';

import { Button , Dialog, DialogTrigger } from '@/gui';

import { PatCreateModal } from './PatCreateModal';

export const PatCreateButton = () => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={(open) => {
            setOpen(open);
        }}>
            <DialogTrigger asChild>
                <Button>
                    Create
                </Button>
            </DialogTrigger>
            {
                open &&
                <PatCreateModal />
            }
        </Dialog>
    );
};
