import { axiosInstance } from "@/core/api";

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (identifier: string, password: string) => {
    // identifier can be email or user id
    const response = await axiosInstance.post<LoginResponse>("/api/auth/login", {
      identifier,
      password,
    });

    return response.data;
  },
};
