import { useState } from 'react';

import { Button } from '../ui/Button';
import { Dialog, DialogTrigger } from '../ui/Dialog';
import { CreatePatModal } from './CreatePatModal';

export const CreatePatButton = () => {
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
