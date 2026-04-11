import axios from "axios";

interface ProblemDetails {
  title?: string;
  detail?: string;
}

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "Something went wrong.";
  }

  const data = error.response?.data as ProblemDetails | undefined;
  const detail = data?.detail?.trim();
  const title = data?.title?.trim();

  if (detail) {
    return detail;
  }

  if (title) {
    return title;
  }

  return error.message || "Request failed.";
}

