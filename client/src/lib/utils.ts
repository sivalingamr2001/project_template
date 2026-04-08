import type { AuthUser } from "@/context/AuthContext"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function GetCurrentUser(): AuthUser | null {
  const sessionData = localStorage.getItem("auth_session")
  if (!sessionData) return null

  try {
    const session = JSON.parse(sessionData)

    return {
      employeeId: session.employeeId,
      name: session.name,
      email: session.email,
      phone: session.phone,
      departmentId: session.departmentId,
      departmentName: session.departmentName,
      role: session.role,
      departmentHod: session.departmentHod,
    }
  } catch {
    return null
  }
}
