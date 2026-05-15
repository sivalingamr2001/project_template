import axios, { type AxiosInstance } from "axios";
import { attachAuthInterceptor } from "./interceptors/authInterceptor";
import { attachErrorInterceptor } from "./interceptors/errorInterceptor";
import { getApiBaseUrl } from "@/lib/utils";

export const createAxiosInstance = (): AxiosInstance => {
  const API_URL = getApiBaseUrl();
  const instance = axios.create({
    baseURL: API_URL,
    timeout: 30_000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  // Attach interceptors
  attachAuthInterceptor(instance);
  attachErrorInterceptor(instance);

  return instance;
};

export const axiosInstance = createAxiosInstance();
