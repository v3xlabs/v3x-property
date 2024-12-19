import { Button } from '../ui/Button';
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/Dialog';

export const CreateLocationModal = () => {
    // const {} = useForm();

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Setup a new Location</DialogTitle>
                <DialogDescription>
                    A location is a place where you want to store items.
                    Examples of locations can be shelves, drawers, or even
                    locations in a warehouse.
                </DialogDescription>
                <div className="flex flex-col w-4 gap-2 p-4">

                </div>
            </DialogHeader>
            <DialogFooter>
                <Button>Create</Button>
            </DialogFooter>
        </DialogContent>
    );
};
