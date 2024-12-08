import { useState } from 'react';
import { useDebounce } from 'use-debounce';

import { useSearch } from '@/api/search';
import { BaseInput } from '@/components/input/BaseInput';

import { ItemPreviewSearch } from '../item/ItemPreviewSearch';
import { Button } from '../ui/Button';

export const SearchInput = () => {
    const [query, setQuery] = useState('');
    const [debounced] = useDebounce(query, 200);
    const { data: searchResults } = useSearch(debounced);

    return (
        <div className="w-full space-y-2">
            <form
                role="search"
                className="w-full flex gap-4 justify-stretch"
                onSubmit={(event) => {
                    event.preventDefault();
                }}
            >
                <BaseInput
                    className="h-full"
                    width="full"
                    type="search"
                    role="searchbox"
                    // eslint-disable-next-line jsx-a11y/aria-props
                    aria-description="search results will appear below"
                    value={query}
                    data-testid="search-input"
                    onChange={(event) => setQuery(event)}
                />
                <Button data-testid="search-button" type="submit">
                    Search
                </Button>
            </form>
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
