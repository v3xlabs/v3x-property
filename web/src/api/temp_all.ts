import { useHttp } from "./core";

type PropertiesResponse = {
    id: number,
};

export const useTempAll = () => useHttp<PropertiesResponse>("/api/properties");
