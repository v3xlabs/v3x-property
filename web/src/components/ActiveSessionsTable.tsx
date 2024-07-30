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
                        const ua = UAParser(session.user_agent);
                        const time = new Date(session.last_access);
                        const x = getRelativeTimeString(time);

                        return (
                            <div
                                key={session.id}
                                className="bg-blue-50 p-2 flex justify-between"
                            >
                                <div>
                                    <div className="space-x-2">
                                        <b>
                                            {[
                                                ua.browser.name,
                                                ua.browser.version,
                                            ]
                                                .filter(Boolean)
                                                .join(' ')}
                                        </b>
                                        <span>on</span>
                                        <b>
                                            {[
                                                ua.os.name,
                                                ua.cpu.architecture,
                                                ua.os.version,
                                            ]
                                                .filter(Boolean)
                                                .join(' ')}
                                        </b>
                                    </div>
                                    <div>{session.user_ip}</div>
                                    <div>{x}</div>
                                    <div>#{session.id}</div>
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
