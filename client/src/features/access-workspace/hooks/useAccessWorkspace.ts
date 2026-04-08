import { useEffect, useMemo, useState } from "react"

import { useAuth } from "@/context/AuthContext"

import type { AccessRequest, QueueMode } from "../types"
import {
  getDefaultRoute,
  getRequestsByMode,
  getSummaryCards,
} from "../utils/accessSelectors"
import { AUDIT_LOGS, EMPLOYEES, NOTIFICATIONS } from "../utils/mockData"
import { fetchAccessRequests } from "../utils/requestApi"

export function useAccessWorkspace(mode: QueueMode = "dashboard") {
  const { user } = useAuth()
  const employeeId = user?.employeeId ?? 0
  const role =
    user?.role === "Hod" || user?.role === "ItTeam" ? user.role : "User"
  const [apiRequests, setApiRequests] = useState<AccessRequest[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!employeeId) return
    setIsLoading(true)
    fetchAccessRequests(employeeId)
      .then(setApiRequests)
      .then(() => setErrorMessage(null))
      .catch((error: Error) => {
        setApiRequests([])
        setErrorMessage(error.message)
      })
      .finally(() => setIsLoading(false))
  }, [employeeId, reloadKey])

  const requests = useMemo(
    () => getRequestsByMode(apiRequests, mode, employeeId),
    [apiRequests, employeeId, mode]
  )
  const summaryCards = useMemo(
    () => getSummaryCards(apiRequests, employeeId),
    [apiRequests, employeeId]
  )
  const searchRequests = (searchTerm: string) =>
    requests.filter((request) =>
      JSON.stringify(request).toLowerCase().includes(searchTerm.toLowerCase())
    )
  const refetch = () => setReloadKey((current) => current + 1)

  return {
    auditLogs: AUDIT_LOGS,
    defaultRoute: getDefaultRoute(role),
    employees: EMPLOYEES,
    errorMessage,
    isLoading,
    notifications: NOTIFICATIONS.filter((item) => item.recipientRole === role),
    refetch,
    requests,
    role,
    searchRequests,
    summaryCards,
    user,
  }
}
