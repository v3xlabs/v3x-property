import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/item/$itemId/')({
    component: () => <div>Hello /item/$itemId!</div>,
});
