import { useState, useEffect, type ReactNode } from "react"
import { MOCK_USERS } from "../lib/constants"
import type { UserRole } from "../lib/types"
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
  const [currentRole, setCurrentRoleState] = useState<UserRole | null>(null)
  const [currentPage, setCurrentPageState] = useState<Page>("LOGIN")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<number>()
  const [isLoading, setIsLoading] = useState(true)

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role)
    setCurrentPageState(
      role === "User"
        ? "EMPLOYEE_DASHBOARD"
        : role === "HOD"
          ? "HOD_APPROVALS"
          : "IT_QUEUE"
    )
  }

  useEffect(() => {
    const checkPersistedAuth = () => {
      const authToken = localStorage.getItem("authToken")
      const userRole = localStorage.getItem("userRole") as UserRole | null

      if (authToken && userRole) {
        setCurrentRoleState(userRole)
        setIsAuthenticated(true)
        setCurrentPageState(
          userRole === "User"
            ? "EMPLOYEE_DASHBOARD"
            : userRole === "HOD"
              ? "HOD_APPROVALS"
              : "IT_QUEUE"
        )
      }
      setIsLoading(false)
    }
    checkPersistedAuth()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("https://localhost:7229/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      // The 401 error happens here if credentials don't match backend database
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Login failed status:", response.status, errorData)
        return false
      }

      const data = await response.json()
      const authToken = data.token
      const userRole = data.role as UserRole

      localStorage.setItem("authToken", authToken)
      localStorage.setItem("userRole", userRole)
      localStorage.setItem("userData", JSON.stringify(data))

      setCurrentRole(userRole)
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
    setIsAuthenticated(false)
    setCurrentRoleState(null)
    setCurrentPageState("LOGIN")
  }

  const setCurrentPage = (page: Page) => {
    setCurrentPageState(page)
  }

  const currentUser =
    currentRole === "HOD"
      ? MOCK_USERS.hod
      : currentRole === "IT"
        ? MOCK_USERS.it
        : currentRole === "User"
          ? MOCK_USERS.employee
          : null

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
        setCurrentRole,
        setCurrentPage,
        setSelectedRequestId,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
