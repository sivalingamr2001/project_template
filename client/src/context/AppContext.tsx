import { useState, useEffect, type ReactNode } from "react"
import type { User, UserRole } from "../lib/types"
import { AppContext } from "@/hooks/useApp"

export type Page =

  | "LOGIN"
  | "EMPLOYEE_DASHBOARD"
  | "EMPLOYEE_REQUESTS"

  | "EMPLOYEE_REQUEST_DETAIL"
  | "USER_PROFILE"
  | "HOD_APPROVALS"

  | "HOD_HISTORY"
  | "HOD_LOOKUP"
  | "IT_QUEUE"

  | "IT_ACTIVE_ACCESS"
  | "IT_LOOKUP"
  | "IT_AUDIT_LOG"

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentRole, setCurrentRoleState] = useState<UserRole | null>(null)
  const [currentPage, setCurrentPageState] = useState<Page>("LOGIN")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<number>()
  const [isLoading, setIsLoading] = useState(true)

  const getDefaultPageForRole = (role: UserRole): Page =>
    role === "User"
      ? "EMPLOYEE_DASHBOARD"
      : role === "HOD"
        ? "HOD_APPROVALS"
        : "IT_QUEUE"

  const normalizeRole = (role: unknown): UserRole | null => {
    if (role === "User" || role === "HOD" || role === "IT") return role
    if (role === 0 || role === "0") return "User"
    if (role === 1 || role === "1") return "HOD"
    if (role === 2 || role === "2") return "IT"
    return null
  }

  const normalizeUser = (data: any): User | null => {
    const role = normalizeRole(data?.role)
    const id = data?.employeeId ?? data?.id
    const name = data?.userName ?? data?.name

    if (!role || typeof id !== "number" || typeof name !== "string") {
      return null
    }

    return {
      id,
      employeeId: data.employeeId ?? id,
      name,
      email: data.email ?? "",
      role,
      departmentId: data.departmentId,
      department: data.departmentName ?? data.department,
      location: data.location,
      phone:
        data.phoneNumber !== undefined && data.phoneNumber !== null
          ? String(data.phoneNumber)
          : data.phone,
      hod: data.hod,
    }
  }

  useEffect(() => {
    const checkPersistedAuth = () => {
      const authToken = localStorage.getItem("authToken")
      const storedUserData = localStorage.getItem("userData")
      const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null
      const user = normalizeUser(parsedUserData)
      const userRole = user?.role ?? normalizeRole(localStorage.getItem("userRole"))

      if (authToken && userRole && user) {
        setCurrentUser(user)
        setCurrentRoleState(userRole)
        setIsAuthenticated(true)
        setCurrentPageState(getDefaultPageForRole(userRole))
      }
      setIsLoading(false)
    }
    checkPersistedAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("https://localhost:7229/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      // The 401 error happens here if credentials don't match backend database
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Login failed status:", response.status, errorData)
        return false
      }

      const data = await response.json()
      const user = normalizeUser(data)
      const userRole = user?.role

      if (!userRole || !user) {
        console.error("Login response is missing required user fields", data)
        return false
      }

      localStorage.setItem("userRole", userRole)
      localStorage.setItem("userData", JSON.stringify(data))

      setCurrentUser(user)
      setCurrentRoleState(userRole)
      setCurrentPageState(getDefaultPageForRole(userRole))
      setIsAuthenticated(true)
      return true
    } catch (error) {
      console.error("Network or parsing error:", error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userData")
    setIsAuthenticated(false)
    setCurrentUser(null)
    setCurrentRoleState(null)
    setCurrentPageState("LOGIN")
  }

  const setCurrentPage = (page: Page) => {
    setCurrentPageState(page)
  }

  // Fixes the "isLoading is never used" warning by using it here
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        currentPage,
        isAuthenticated,
        selectedRequestId,
        login, // Now matches Promise<boolean> type
        logout,
        setCurrentPage,
        setSelectedRequestId,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
