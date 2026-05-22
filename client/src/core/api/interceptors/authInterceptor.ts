import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

export const attachAuthInterceptor = (instance: AxiosInstance): void => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          if (!config.headers) config.headers = {};
          config.headers["Authorization"] = `Bearer ${token}`;
        }
      } catch (e) {
        // ignore
      }

      return config;
    },
    (error) => Promise.reject(error),
  );
};
