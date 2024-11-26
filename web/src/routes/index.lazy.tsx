import { createLazyFileRoute } from '@tanstack/react-router';

import { UserProfile } from '../components/UserProfile';

const component = () => {
    return (
        <div className="p-2 mx-auto w-full max-w-4xl">
            <h3>Welcome Home!</h3>
            <div className="w-full flex items-center justify-center gap-4">
                <UserProfile user_id="1" variant="full" />
                <UserProfile user_id="1" variant="compact" />
                <UserProfile user_id="1" variant="avatar" />
            </div>
        </div>
    );
};

export const Route = createLazyFileRoute('/')({
    component,
});
