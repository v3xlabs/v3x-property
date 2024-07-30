import { preflightAuth } from './api/auth';
import { Navbar } from './components/Navbar';

export const App = () => {
    preflightAuth();

    return (
        <div className="">
            <Navbar />
            <span>Hello World</span>
        </div>
    );
};
