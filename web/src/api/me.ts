import useSWR from "swr";
import { useAuth } from "./auth";

export type ApiMeResponse = {
    id: number,
    oauth_sub: "105880077790926797153",
    "oauth_data": {
        "sub": "105880077790926797153",
        "name": "Luc van Kampen",
        "given_name": "Luc",
        "family_name": "van Kampen",
        "middle_name": null,
        "nickname": null,
        "preferred_username": null,
        "profile": null,
        "picture": "https://lh3.googleusercontent.com/a-/ALV-UjXZQ67-d4Mp6wCcoLVMRIziMFhwoGrKF9lH8LaxfqUaX101w2oT-ST6uklZXhlMD7nw6Ha1_JbCLKzMJ71vGjq57DX4ugxtXOKLAKCMI0AldMDgUtnvz-B7Tu-z5bV26hlYgfEs9ClXVbKhxtt-fePgyD_gK8M9HGtCg0m-ogvyrTX8RNpyOOLX1mCjk30kdiUzZxOUWH4PzaEdHTSiKkcXsn2gF1JUnIZJRfkiOnT8fNxK0VgtEvERaeFZdYgbx0CSLiYEdFyFelZ7V6rZSrsZ9W2mE-AF5gyasjbms-2RonFamlx19g0rBu1C5idGamXwbXhLOKuxDR5f08lHDKa3c521fXsM7FeSElksNjyHIo_CKGKJIbas4WIqMw6j63lwGU1sBm32OwhyOcV4a27FSNe6-fZho4f1FP18aOeowkAK17MGCW0cIq86GGkgIZwwShIqucwcGPrtSGiCveJP6Plu9A1_IT1WK29cmJ93Mr6wWUUEcY0wiB0B9UEX3JnyAZ7_FDkr1LiLo_598s-ntvrWNgs1_oVvOMu8AWlNTQxAIPqvSj8dYIXpRYZtahlem3BqYYyCy8CQhH6m4f1ntyLZsCEv5_imN9_PPe0R3G1U0BaIkam1sod8YFPQChMLMZV6KbQFCSqfGWfjdrjPz4JW9hxBGtbe2ZQ15Tz_Xwu3HiKEAQkgH23IdJ7G6HZ0IXKqFS9C4C875mI15HUeU4F-204pEuwM5ZIXJ_BgHT5lg7vmVfL4spVpk2bABa2OBdon5NveUHVsh5ouQoSvT_7CqnZccME9UFAtlqXL2x-itvcPnMQeWQ9LeFoqHtHyZni5FxMSvJAMgzvmopUxWRexJ7qq1DE7XnIon4Pf6jRXavGGVuVDg7d6jXnwi2HJPaI7FCtj7NxoGdXfE7YgvQFAO9EzIj9iQ0e1xEcDlul4ZwmJteDXa0x7ChZVAbngYeChgK2nYQcb7LB3s_4g=s96-c",
        "website": null,
        "email": "luc@v3x.email",
        "email_verified": true,
        "gender": null,
        "birthdate": null,
        "zoneinfo": null,
        "locale": null,
        "phone_number": null,
        "phone_number_verified": false,
        "address": null,
        "updated_at": null
    },
    "nickname": any
}

export const apiMe = async (token: string | null): Promise<ApiMeResponse | null> => {
    const headers = new Headers();

    headers.append("Authorization", "Bearer " + token);

    try {
        const response = await fetch("http://localhost:3000/me", { headers });
        const data = await response.json();

        return data as ApiMeResponse;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const useApiMe = (token: string | null) => useSWR(token && "/api/me", async () => {
    return await apiMe(token);
});