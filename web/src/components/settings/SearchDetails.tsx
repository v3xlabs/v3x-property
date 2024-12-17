import { useMutation } from '@tanstack/react-query';
import { SiMeilisearch } from 'react-icons/si';

import { useAuth } from '@/api/auth';
import { BASE_URL } from '@/api/core';

import { Button } from '../ui/Button';

export const SearchDetails = () => {
    const { token } = useAuth();
    const { mutate: indexAllItems } = useMutation({
        mutationFn: async () => {
            const response = await fetch(BASE_URL + 'search/reindex', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.json();
        },
    });

    return (
        <div className="space-y-2">
            <h2 className="h2">Search</h2>
            <div className="space-y-2.5 card">
                <div className="flex flex-row gap-2 items-center">
                    <SiMeilisearch />
                    <h3 className="font-bold">Meilisearch</h3>
                </div>
                <p>
                    Meilisearch is the search engine that allows you to search
                    for items in the database.
                </p>
                <div className="flex gap-2">
                    <Button onClick={() => indexAllItems()} variant="primary">
                        Index All Items
                    </Button>
                </div>
            </div>
        </div>
    );
};
