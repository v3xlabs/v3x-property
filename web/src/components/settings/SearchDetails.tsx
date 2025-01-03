import { SiMeilisearch } from 'react-icons/si';

import { useAuth, useSearchClearIndex, useSearchIndexAllItems } from '@/api';

import { Button } from '../../gui/Button';

export const SearchDetails = () => {
    const { token } = useAuth();
    const { mutate: indexAllItems } = useSearchIndexAllItems();
    const { mutate: clearIndex } = useSearchClearIndex();

    return (
        <div className="card space-y-2.5">
            <div className="flex flex-row items-center gap-2">
                <SiMeilisearch />
                <h3 className="font-bold">Meilisearch</h3>
            </div>
            <p>
                Meilisearch is the search engine that allows you to search for
                items in the database.
            </p>
            <div className="flex gap-2">
                <Button onClick={() => indexAllItems()} variant="primary">
                    Index All Items
                </Button>
                <Button onClick={() => clearIndex()} variant="secondary">
                    Clear Index
                </Button>
            </div>
        </div>
    );
};
