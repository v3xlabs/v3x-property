import { useHttp } from "./core";

export const useSessions = () => useHttp<any>("/api/sessions");
