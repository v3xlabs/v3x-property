import { clsx } from 'clsx';
import { FC } from 'react';
import { UAParser } from 'ua-parser-js';

import { SessionResponse, useAuth , useGeoIp , useSessions } from '@/api';
import { LeafletPreview } from '@/components/LeafletPreview';
import { Button } from '@/gui';
import { getRelativeTimeString } from '@/util/date';

const ActiveSession: FC<{ session: SessionResponse }> = ({ session }) => {
    const { refetch: updateSessions } = useSessions();
    const { token } = useAuth();
    const { data: geoip } = useGeoIp(session.user_ip);
    const user_agent = UAParser(session.user_agent);
    const last_accessed = new Date(session.last_access);
    const last_accessed_formatted = getRelativeTimeString(last_accessed);
    const isRecent = last_accessed.getTime() > Date.now() - 1000 * 60 * 60 * 24;

    const latitude = geoip?.latitude || 0;
    const longitude = geoip?.longitude || 0;

    return (
        <div
            key={session.session_id}
            className="bg-backgroundSecondary flex h-fit items-center justify-between gap-2 p-2"
        >
            {geoip?.latitude && (
                <div className="h-full">
                    <div className="aspect-square h-32 w-32 overflow-hidden rounded-lg border border-neutral-400 bg-gray-100">
                        <LeafletPreview latitude={latitude} longitude={longitude} />
                    </div>
                </div>
            )}
            <div className="h-fit">
                <div className="font-bold">{session.user_ip}</div>
                <div className="space-x-2">
                    <b>
                        {[user_agent.browser.name, user_agent.browser.version]
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
                        isRecent && 'text-green-500',
                        'flex items-center gap-1'
                    )}
                >
                    {isRecent && (
                        <div className="flex items-center pt-[1px]">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        </div>
                    )}
                    <span>{last_accessed_formatted}</span>
                </div>
                <div className="text-neutral-400">
          #{session.session_id?.slice(0, 6)}
                </div>
            </div>
            <div className="h-full">
                <div className="h-full">
                    <Button
                        variant="default"
                        onClick={() => {
                            // TODO: reformat url
                            fetch(
                                `http://localhost:3000/api/sessions/${session.session_id}`,
                                {
                                    method: 'DELETE',
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                        'Content-Type': 'application/json',
                                    },
                                }
                            ).then(() => {
                                updateSessions();
                            });
                        }}
                    >
            Deauthorize
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const ActiveSessionsTable: FC = () => {
    const { data: sessions } = useSessions();

    return (
        <div className="space-y-2 p-2">
            <h2 className="font-bold">Active Sessions</h2>
            <hr />
            <p>These are the sessions that are currently active for your account.</p>
            <div className="space-y-2">
                {sessions &&
          sessions
              .sort(
              // sort by last access time
                  (a, b) =>
                      new Date(b.last_access).getTime() -
                new Date(a.last_access).getTime()
              )
              .map((session) => (
                  <ActiveSession session={session} key={session.session_id} />
              ))}
            </div>
            <p>
        If there is a session in here that you do not recognize, you can
        deauthorize it.
            </p>
            <hr />
            <Button>Log out everywhere</Button>
        </div>
    );
};
