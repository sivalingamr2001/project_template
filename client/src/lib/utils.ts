import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to get VITE_BASE_API_URL from environment variables
export const getApiBaseUrl = (): string => {
  const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const trimmedBaseUrl = rawApiBaseUrl?.replace(/\/+$/g, "") ?? "/api";
  return trimmedBaseUrl.endsWith("/api")
    ? trimmedBaseUrl
    : `${trimmedBaseUrl}/api`;
};
