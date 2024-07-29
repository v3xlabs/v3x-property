import { createFileRoute } from '@tanstack/react-router';
import { FC } from 'react';

import { useSessions } from '../api/sessions';

const component: FC = () => {
    const { data: sessions } = useSessions();

    return (
        <div className="p-2">
            Hello from About!
            <div>
                {sessions &&
                    sessions.map((session: any) => (
                        <div key={session.id}>
                            <span>{session.id}</span>
                            <button>Disconnect</button>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export const Route = createFileRoute('/sessions')({ component });
