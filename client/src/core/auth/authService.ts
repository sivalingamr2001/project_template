import { axiosInstance } from "@/core/api/axiosInstance";
import { tokenStorage } from "./tokenStorage";
import type { AuthResponse, LoginPayload } from "@/types/common.types";

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<AuthResponse>("/auth/login", payload);
    tokenStorage.setRefreshToken(data.refreshToken);
    return data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      await axiosInstance.post("/auth/logout", { refreshToken });
    }
    tokenStorage.clearRefreshToken();
  },
};
