import { SCPage } from '../layouts/SimpleCenterPage';

export const UnauthorizedResourceModal = () => {
    return (
        <SCPage title="Unauthorized">
            <div className="card">
                <p>You are not authorized to access this resource.</p>
                <div>Try logging in</div>
            </div>
        </SCPage>
    );
};
