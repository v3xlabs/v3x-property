import { createLazyFileRoute } from '@tanstack/react-router';

import { ItemPreview } from '@/components/item/ItemPreview';
import { UserProfile } from '@/components/UserProfile';
import { SCPage } from '@/layouts/SimpleCenterPage';

const component = () => {
    return (
        <SCPage title="Home">
            <div className="card">
                <div className="w-full flex items-center justify-center gap-4">
                    {/* <StlPreview stlUrl="/test.stl" /> */}
                </div>
            </div>
            <div className="card">
                <div className="w-full flex items-center justify-center gap-4">
                    <UserProfile user_id="1" variant="full" />
                    <UserProfile user_id="2" variant="full" />
                    <UserProfile user_id="2" variant="compact" />
                    <UserProfile user_id="2" variant="avatar" />
                </div>
                <div className="w-full flex items-center justify-center gap-4">
                    <ItemPreview item_id="1" />
                </div>
            </div>
        </SCPage>
    );
};

export const Route = createLazyFileRoute('/')({
    component,
});
