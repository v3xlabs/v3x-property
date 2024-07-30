import { clsx } from 'clsx';
import { FC } from 'react';
import { UAParser } from 'ua-parser-js';

import { useSessions } from '../api/sessions';
import { getRelativeTimeString } from '../util/date';

export const ActiveSessionsTable: FC = () => {
    const { data: sessions } = useSessions();

    return (
        <div className="p-2 space-y-2">
            <h2 className="font-bold">Active Sessions</h2>
            <hr />
            <p>
                These are the sessions that are currently active for your
                account.
            </p>
            <div className="space-y-2">
                {sessions &&
                    sessions.map((session) => {
                        const user_agent = UAParser(session.user_agent);
                        const last_accessed = new Date(session.last_access);
                        const last_accessed_formatted =
                            getRelativeTimeString(last_accessed);
                        const isRecent =
                            last_accessed.getTime() >
                            Date.now() - 1000 * 60 * 60 * 24;

                        return (
                            <div
                                key={session.id}
                                className="bg-blue-50 p-2 flex justify-between items-center"
                            >
                                <div>
                                    <div className="font-bold">
                                        {session.user_ip}
                                    </div>
                                    <div className="space-x-2">
                                        <b>
                                            {[
                                                user_agent.browser.name,
                                                user_agent.browser.version,
                                            ]
                                                .filter(Boolean)
                                                .join(' ')}
                                        </b>
                                        <span>on</span>
                                        <b>
                                            {[
                                                user_agent.os.name,
                                                user_agent.cpu.architecture,
                                                user_agent.os.version,
                                            ]
                                                .filter(Boolean)
                                                .join(' ')}
                                        </b>
                                    </div>
                                    <div
                                        className={clsx(
                                            isRecent && 'text-green-500'
                                        )}
                                    >
                                        {last_accessed_formatted}
                                    </div>
                                    <div className="text-neutral-400">
                                        #{session.id.slice(0, 6)}
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <button className="btn">Deauthorize</button>
                                </div>
                            </div>
                        );
                    })}
            </div>
            <p>
                If there is a session in here that you do not recognize, you can
                deauthorize it.
            </p>
            <hr />
            <button className="btn">Log out everywhere</button>
        </div>
    );
};
