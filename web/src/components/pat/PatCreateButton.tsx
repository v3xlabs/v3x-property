import { useState } from 'react';

import { Button } from '../../gui/Button';
import { Dialog, DialogTrigger } from '../../gui/dialog/Dialog';
import { CreatePatModal } from './CreatePatModal';

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
                <CreatePatModal />
            }
        </Dialog>
    );
};
