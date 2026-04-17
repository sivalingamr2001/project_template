import { api } from "@/shared/lib/axios";
import type {
  CreateEmployeeRequest,
  EmployeeResponse,
  UpdateEmployeeRequest,
} from "./employees.types";

export async function getEmployees() {
  const response = await api.get<EmployeeResponse[]>("/employees");
  return response.data;
}

export async function getEmployeeById(employeeId: number) {
  const response = await api.get<EmployeeResponse>(`/employees/${employeeId}`);
  return response.data;
}

export async function createEmployee(request: CreateEmployeeRequest) {
  const response = await api.post<EmployeeResponse>("/employees", request);
  return response.data;
}

export async function updateEmployee(employeeId: number, request: UpdateEmployeeRequest) {
  const response = await api.put<EmployeeResponse>(`/employees/${employeeId}`, request);
  return response.data;
}

export async function deleteEmployee(employeeId: number) {
  await api.delete(`/employees/${employeeId}`);
}
