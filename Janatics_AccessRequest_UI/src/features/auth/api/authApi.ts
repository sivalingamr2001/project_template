import type { AxiosResponse } from "axios"
import { apiService, type ApiResponse } from "@/shared/lib/api-client"

export type AuthResponse = {
  departmentHod: number
  departmentId: number
  departmentName: string
  email: string
  employeeId: number
  name: string
  role: string
}

export type LoginRequest = {
  username: string
  password: string
}

export type RegisterRequest = {
  firstName: string
  lastName: string
  username: string
  password: string
  email: string
  mobile: string
  location: string
  role: string
  departmentId: number
}

const handleResponse = async <T>(
  promise: Promise<AxiosResponse<ApiResponse<T>>>
) => {
  const response = await promise
  return response.data
}

export const authApi = {
  login: (request: LoginRequest) =>
    handleResponse<AuthResponse>(
      apiService.post<ApiResponse<AuthResponse>>("/auth/login", request)
    ),

  register: (request: RegisterRequest) =>
    handleResponse<AuthResponse>(
      apiService.post<ApiResponse<AuthResponse>>("/auth/register", request)
    ),
}
