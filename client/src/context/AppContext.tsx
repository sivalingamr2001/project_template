import { useEffect, useState, type ReactNode } from "react"
import type { User, UserRole } from "../lib/types"
import { AppContext } from "@/hooks/useApp"
import {
  fetchDashboardData,
  loginWithEmployeeCode,
  mapApiUserToClient,
} from "@/lib/access-request-api"

export type Page =
  | "LOGIN"
  | "EMPLOYEE_DASHBOARD"
  | "EMPLOYEE_REQUESTS"
  | "EMPLOYEE_REQUEST_DETAIL"
  | "USER_PROFILE"
  | "HOD_APPROVALS"
  | "HOD_HISTORY"
  | "HOD_LOOKUP"
  | "HOD_ALL_REQUESTS"
  | "IT_QUEUE"
  | "IT_ACTIVE_ACCESS"
  | "IT_LOOKUP"
  | "IT_AUDIT_LOG"
  | "IT_ALL_REQUESTS"

function getDefaultPageForRole(role: UserRole): Page {
  return role === "User"
    ? "EMPLOYEE_DASHBOARD"
    : role === "HOD"
      ? "HOD_APPROVALS"
      : "IT_QUEUE"
}

function normalizeRole(role: unknown): UserRole | null {
  if (role === "User" || role === "HOD" || role === "IT") return role
  if (role === "Hod") return "HOD"
  if (role === "ItTeam") return "IT"
  return null
}

function normalizeUser(data: unknown): User | null {
  if (!data || typeof data !== "object") return null

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

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentRole, setCurrentRoleState] = useState<UserRole | null>(null)
  const [currentPage, setCurrentPageState] = useState<Page>("LOGIN")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<number>()
  const [selectedAccessItemId, setSelectedAccessItemId] = useState<number>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      const authToken = localStorage.getItem("authToken")
      const storedUserData = localStorage.getItem("userData")
      const user = normalizeUser(storedUserData ? JSON.parse(storedUserData) : null)

      if (!authToken) {
        setIsLoading(false)
        return
      }

      if (user) {
        setCurrentUser(user)
        setCurrentRoleState(user.role)
        setCurrentPageState(getDefaultPageForRole(user.role))
        setIsAuthenticated(true)
      }

      try {
        const dashboard = await fetchDashboardData()
        setCurrentUser(dashboard.currentUser)
        setCurrentRoleState(dashboard.currentUser.role)
        setCurrentPageState(getDefaultPageForRole(dashboard.currentUser.role))
        setIsAuthenticated(true)
        localStorage.setItem("userRole", dashboard.currentUser.role)
        localStorage.setItem("userData", JSON.stringify(dashboard.currentUser))
      } catch {
        localStorage.removeItem("authToken")
        localStorage.removeItem("userRole")
        localStorage.removeItem("userData")
        setCurrentUser(null)
        setCurrentRoleState(null)
        setCurrentPageState("LOGIN")
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    void restoreSession()
  }, [])

  useEffect(() => {
    if (currentPage !== "EMPLOYEE_REQUEST_DETAIL") {
      setSelectedAccessItemId(undefined)
    }
  }, [currentPage])

  const login = async (employeeCode: string, password: string) => {
    try {
      const data = await loginWithEmployeeCode(employeeCode, password)
      const user = mapApiUserToClient(data.session.user)

      localStorage.setItem("authToken", data.accessToken)
      localStorage.setItem("userRole", user.role)
      localStorage.setItem("userData", JSON.stringify(user))

      setCurrentUser(user)
      setCurrentRoleState(user.role)
      setCurrentPageState(getDefaultPageForRole(user.role))
      setIsAuthenticated(true)
      return true
    } catch (error) {
      console.error("Login failed", error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userData")
    setCurrentUser(null)
    setCurrentRoleState(null)
    setCurrentPageState("LOGIN")
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        currentPage,
        isAuthenticated,
        selectedRequestId,
        selectedAccessItemId,
        login,
        logout,
        setCurrentPage: setCurrentPageState,
        setSelectedRequestId,
        setSelectedAccessItemId,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
