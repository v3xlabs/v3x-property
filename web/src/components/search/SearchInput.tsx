import { useState } from 'react';

import { useSearch } from '@/api/search';
import { BaseInput } from '@/components/input/BaseInput';

import { ItemPreviewSearch } from '../item/ItemPreviewSearch';
import { Button } from '../ui/Button';

export const SearchInput = () => {
    const [query, setQuery] = useState('');
    const { data: searchResults } = useSearch({
        variables: { query },
    });

    return (
        <div className="w-full space-y-2">
            <div className="w-full flex gap-4 justify-stretch">
                <BaseInput
                    className="h-full"
                    width="full"
                    value={query}
                    data-testid="search-input"
                    onChange={(event) => setQuery(event)}
                />
                <Button data-testid="search-button">Search</Button>
            </div>
            {searchResults && (
                <div className="w-full space-y-2" data-testid="search-results">
                    {searchResults.map((result) => (
                        <div key={result.item_id}>
                            <ItemPreviewSearch item={result} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
