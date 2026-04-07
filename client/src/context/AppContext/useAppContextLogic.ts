import { useEffect, useState } from "react"
import type { User, UserRole } from "@/lib/types"
import {
  fetchDashboardData,
  loginWithEmployeeCode,
  mapApiUserToClient,
} from "@/lib/access-request-api"
import type { Page, AppContextType } from "./types"
import { getDefaultPageForRole, normalizeUser } from "./utils"

export function useAppContextLogic(): AppContextType & { isLoading: boolean } {
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
      const user = normalizeUser(
        storedUserData ? JSON.parse(storedUserData) : null
      )

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

  return {
    currentUser,
    currentRole,
    currentPage,
    isAuthenticated,
    selectedRequestId,
    selectedAccessItemId,
    isLoading,
    login,
    logout,
    setCurrentPage: setCurrentPageState,
    setSelectedRequestId,
    setSelectedAccessItemId,
  }
}
