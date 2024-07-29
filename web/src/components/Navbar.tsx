import useSWR from "swr";
import { apiMe, useApiMe } from "../api/me";
import { useAuth } from "../api/auth";

const LOGIN_URL = "http://localhost:3000/login";

export const Navbar = () => {
    const { token, clearAuthToken } = useAuth();
    const { data: meData, isLoading: isVerifyingAuth } = useApiMe(token);
    
    const login_here_url = LOGIN_URL + "?redirect=" + encodeURIComponent(window.location.href);

    console.log({token});

    return (
        <div className="w-full bg-white border-b h-8 flex items-center justify-between">
            <div className="font-semibold text-base pl-4 pr-4 hover:bg-black/10 border-r h-full flex items-center">
                v3x.property
            </div>
            {
                meData && <div className="h-full border-l px-2 hover:bg-black/10 relative">
                    <div className="h-full p-1 flex items-center gap-2">
                        <div className="h-full aspect-square bg-black/10">
                            <img src={meData.oauth_data.picture} className="w-full h-full object-contain" />
                        </div>
                        <div>{meData.oauth_data.name}</div>
                        <div className="absolute right-0 w-fit top-full bg-white border">
                            <div className="px-3 py-0.5">
                                Hello
                            </div>
                            <button className="px-3 py-0.5 hover:bg-black/10" onClick={() => {
                                clearAuthToken();
                            }}>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            }
            {
                !token &&
                <a href={login_here_url} className="h-full border-l px-2 py-0.5 flex items-center hover:bg-black/10">
                    Login
                </a>
            }
            {/* <div className="h-full border-l px-2 hover:bg-black/10">
                <div className="h-full p-1 flex items-center gap-2">
                    <div className="h-full aspect-square bg-black/10">

                    </div>
                    <div>Luc van Kampen</div>
                </div>
            </div> */}
        </div>
    );
};
