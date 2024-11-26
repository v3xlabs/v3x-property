import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$itemId')({
    component: () => <div>Hello /$itemId!</div>,
});
