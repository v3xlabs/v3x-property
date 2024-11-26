import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/item/$itemId/edit')({
    component: () => <div>Hello /item/$itemId/edit!</div>,
});
