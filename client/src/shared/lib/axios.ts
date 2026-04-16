import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  statusCode: number;
  code?: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
  _skipAuthRefresh?: boolean;
}

// ─── Token Store (swap with your auth store e.g. Zustand / Redux) ─────────────

const tokenStore = {
  getAccessToken: (): string | null => localStorage.getItem("accessToken"),
  getRefreshToken: (): string | null => localStorage.getItem("refreshToken"),
  setTokens: (access: string, refresh: string): void => {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
  },
  clear: (): void => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
};

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

// ─── Factory ──────────────────────────────────────────────────────────────────

function createApiInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
    timeout: 15_000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true, // include cookies for HttpOnly refresh token flows
  });

  attachRequestInterceptor(instance);
  attachResponseInterceptor(instance);

  return instance;
}

// ─── Request Interceptor ──────────────────────────────────────────────────────

function attachRequestInterceptor(instance: AxiosInstance): void {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenStore.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Attach a unique request ID for tracing
      config.headers["X-Request-ID"] = crypto.randomUUID();

      // Attach client timezone
      config.headers["X-Timezone"] =
        Intl.DateTimeFormat().resolvedOptions().timeZone;

      return config;
    },
    (error: AxiosError) => Promise.reject(normalizeError(error))
  );
}

// ─── Response Interceptor ─────────────────────────────────────────────────────

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void): void {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string): void {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function attachResponseInterceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,

    async (error: AxiosError) => {
      const config = error.config as RetryConfig;

      if (!config) return Promise.reject(normalizeError(error));

      // ── 401: Token Refresh ──────────────────────────────────────────────────
      if (
        error.response?.status === 401 &&
        !config._skipAuthRefresh &&
        tokenStore.getRefreshToken()
      ) {
        if (isRefreshing) {
          // Queue the request until refresh completes
          return new Promise((resolve) => {
            subscribeTokenRefresh((newToken: string) => {
              config.headers.Authorization = `Bearer ${newToken}`;
              resolve(instance(config));
            });
          });
        }

        isRefreshing = true;
        config._skipAuthRefresh = true;

        try {
          const { data } = await instance.post<{
            accessToken: string;
            refreshToken: string;
          }>(
            "/auth/refresh",
            { refreshToken: tokenStore.getRefreshToken() },
            { _skipAuthRefresh: true } as RetryConfig
          );

          tokenStore.setTokens(data.accessToken, data.refreshToken);
          onTokenRefreshed(data.accessToken);

          config.headers.Authorization = `Bearer ${data.accessToken}`;
          return instance(config);
        } catch (refreshError) {
          tokenStore.clear();
          window.dispatchEvent(new CustomEvent("auth:logout"));
          return Promise.reject(normalizeError(refreshError as AxiosError));
        } finally {
          isRefreshing = false;
        }
      }

      // ── Exponential Retry ───────────────────────────────────────────────────
      const statusCode = error.response?.status ?? 0;
      const shouldRetry =
        RETRYABLE_STATUS_CODES.has(statusCode) || error.code === "ECONNABORTED";

      if (shouldRetry) {
        config._retryCount = (config._retryCount ?? 0) + 1;

        if (config._retryCount <= MAX_RETRIES) {
          const delay = RETRY_DELAY_MS * 2 ** (config._retryCount - 1);
          await sleep(delay);
          return instance(config);
        }
      }

      return Promise.reject(normalizeError(error));
    }
  );
}

// ─── Error Normalizer ─────────────────────────────────────────────────────────

function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const serverMessage =
      (error.response?.data as { message?: string })?.message ?? null;

    return {
      statusCode: status,
      code: error.code,
      message: serverMessage ?? httpStatusMessage(status) ?? error.message,
      details: error.response?.data,
    };
  }

  if (error instanceof Error) {
    return { statusCode: 0, message: error.message };
  }

  return { statusCode: 0, message: "An unexpected error occurred." };
}

function httpStatusMessage(status: number): string | null {
  const map: Record<number, string> = {
    400: "Bad request. Please check your input.",
    401: "Authentication required.",
    403: "You do not have permission to perform this action.",
    404: "The requested resource was not found.",
    409: "Conflict with the current state of the resource.",
    422: "Validation failed.",
    429: "Too many requests. Please slow down.",
    500: "Internal server error. Try again later.",
    502: "Bad gateway.",
    503: "Service temporarily unavailable.",
    504: "Gateway timeout.",
  };
  return map[status] ?? null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ─── Request Cancellation ─────────────────────────────────────────────────────

export class RequestCanceller {
  private controller = new AbortController();

  get signal(): AbortSignal {
    return this.controller.signal;
  }

  cancel(reason = "Request cancelled by user."): void {
    this.controller.abort(reason);
    this.controller = new AbortController(); // reset for reuse
  }
}

// ─── Typed HTTP Methods ───────────────────────────────────────────────────────

export const api: AxiosInstance = createApiInstance();

export const apiService = {
  get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return api.get<T>(url, config);
  },

  post<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return api.post<T>(url, data, config);
  },

  put<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return api.put<T>(url, data, config);
  },

  patch<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return api.patch<T>(url, data, config);
  },

  delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return api.delete<T>(url, config);
  },
} as const;
