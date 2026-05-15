import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

export const attachAuthInterceptor = (instance: AxiosInstance): void => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => config,
    (error) => Promise.reject(error),
  );
};
