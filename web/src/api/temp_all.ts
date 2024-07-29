import useSWR from "swr";
import { useHttp } from "./core";

type PropertiesResponse = {
    id: number,
};

export const useTempAll = (token: string | null) => useHttp<PropertiesResponse>("/api/properties", token);
