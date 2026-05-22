import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

export const attachAuthInterceptor = (instance: AxiosInstance): void => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          // Ensure headers is an object compatible with Axios
          const headers = (config.headers as Record<string, unknown>) || {};
          headers["Authorization"] = `Bearer ${token}`;
          config.headers = headers as InternalAxiosRequestConfig["headers"];
        }
      } catch (e) {
        // ignore
      }

      return config;
    },
    (error) => Promise.reject(error),
  );
};
