import { BaseInput } from '../input/BaseInput';

export const SearchInput = () => {
    return (
        <div className="w-full">
            <div className="w-full flex gap-4 justify-stretch">
                <BaseInput className="h-full" width="full" />
                <button className="btn">Search</button>
            </div>
        </div>
    );
};
