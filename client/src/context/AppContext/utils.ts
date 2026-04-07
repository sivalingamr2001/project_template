import type { User, UserRole } from "@/lib/types"
import type { Page } from "./types"

export function getDefaultPageForRole(role: UserRole): Page {
  return role === "User"
    ? "EMPLOYEE_DASHBOARD"
    : role === "HOD"
      ? "HOD_APPROVALS"
      : "IT_QUEUE"
}

export function normalizeRole(role: unknown): UserRole | null {
  if (role === "User" || role === "HOD" || role === "IT") {
    return role
  }

  if (role === "Hod") {
    return "HOD"
  }

  if (role === "ItTeam") {
    return "IT"
  }

  return null
}

export function normalizeUser(data: unknown): User | null {
  if (!data || typeof data !== "object") {
    return null
  }

  const value = data as Record<string, unknown>
  const role = normalizeRole(value.role)

  if (
    !role ||
    typeof value.employeeId !== "number" ||
    typeof value.name !== "string" ||
    typeof value.email !== "string"
  ) {
    return null
  }

  return {
    id: value.employeeId,
    employeeId: value.employeeId,
    name: value.name,
    email: value.email,
    role,
    departmentId:
      typeof value.departmentId === "number" ? value.departmentId : undefined,
    department:
      typeof value.department === "string" ? value.department : undefined,
  }
}
