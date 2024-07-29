import { useHttp } from "./core";

export type ApiMeResponse = {
    id: number,
    oauth_sub: string,
    "oauth_data": {
        "sub": string,
        "name": string,
        "given_name": string,
        "family_name": string,
        "middle_name": null,
        "nickname": null,
        "preferred_username": null,
        "profile": null,
        "picture": string,
        "website": null,
        "email": string;
        "email_verified": boolean,
        "gender": null,
        "birthdate": null,
        "zoneinfo": null,
        "locale": null,
        "phone_number": null,
        "phone_number_verified": boolean,
        "address": null,
        "updated_at": null
    },
    "nickname": any
}

export const useApiMe = () => useHttp<ApiMeResponse>("/me");
