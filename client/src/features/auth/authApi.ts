import type { LoginInput, User } from "@/features/auth/auth.types";
import { apiService, type ApiError } from "@/shared/lib/axios";

const auth_session = "budget-portal-session";

type LoginResponse = {
  session: {
    user: {
      employeeId: number;
      name: string;
      email: string;
      departmentId: number;
      departmentName: string;
      role: string;
      departmentHod?: {
        employeeId: number;
        name: string;
        email: string;
      } | null;
    };
  };
};

export async function loginRequest(input: LoginInput) {
  try {
    const response = await apiService.post<LoginResponse, LoginInput>("/auth/login", input);
    const user: User = response.data.session.user;
    window.localStorage.setItem(auth_session, JSON.stringify(user));
    return user;
  } catch (error) {
    const statusCode = (error as Partial<ApiError>).statusCode;
    if (statusCode === 401) {
      throw new Error("Invalid employee ID or password.");
    }

    throw error instanceof Error ? error : new Error("Unable to sign in right now.");
  }
}

export function getStoredSession() {
  const session = window.localStorage.getItem(auth_session);
  return session ? (JSON.parse(session) as User) : null;
}

export function logoutRequest() {
  window.localStorage.removeItem(auth_session);
}
