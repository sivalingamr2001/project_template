import { useEffect, useMemo, useState } from "react"

import { useAuth } from "@/context/AuthContext"

import type {
  AccessRequest,
  AuditLogItem,
  EmployeeRecord,
  NotificationItem,
  QueueMode,
} from "../types"
import {
  getDefaultRoute,
  getRequestsByMode,
  getSummaryCards,
} from "../utils/accessSelectors"
import {
  fetchAccessRequests,
  fetchAuditLogs,
  fetchEmployees,
  fetchNotifications,
  markNotificationAsRead,
} from "../utils/requestApi"

type WorkspaceScope = "full" | "notifications"

export function useAccessWorkspace(
  mode: QueueMode = "dashboard",
  scope: WorkspaceScope = "full"
) {
  const { user } = useAuth()
  const employeeId = user?.employeeId ?? 0
  const role =
    user?.role === "Hod" || user?.role === "ItTeam" ? user.role : "User"
  const [apiRequests, setApiRequests] = useState<AccessRequest[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([])
  const [employees, setEmployees] = useState<EmployeeRecord[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!employeeId) {
      setApiRequests([])
      setAuditLogs([])
      setEmployees([])
      setNotifications([])
      setErrorMessage(null)
      setIsLoading(false)
      return
    }

    const loadWorkspace = async () => {
      setIsLoading(true)

      const [requestsResult, notificationsResult, employeesResult, auditResult] =
        await Promise.allSettled([
          scope === "full"
            ? fetchAccessRequests(employeeId)
            : Promise.resolve([] as AccessRequest[]),
          fetchNotifications(employeeId),
          scope === "full"
            ? fetchEmployees()
            : Promise.resolve([] as EmployeeRecord[]),
          scope === "full"
            ? fetchAuditLogs()
            : Promise.resolve([] as AuditLogItem[])
        ])

      setApiRequests(
        requestsResult.status === "fulfilled" ? requestsResult.value : []
      )

      if (notificationsResult.status === "fulfilled") {
        setNotifications(notificationsResult.value)
      } else {
        setNotifications([])
      }

      if (employeesResult.status === "fulfilled") {
        setEmployees(employeesResult.value)
      } else {
        setEmployees([])
      }

      if (auditResult.status === "fulfilled") {
        setAuditLogs(auditResult.value)
      } else {
        setAuditLogs([])
      }

      const firstError = [
        requestsResult,
        notificationsResult,
        employeesResult,
        auditResult,
      ].find((result) => result.status === "rejected")

      setErrorMessage(
        firstError?.status === "rejected"
          ? firstError.reason instanceof Error
            ? firstError.reason.message
            : "Unable to load workspace data."
          : null
      )
      setIsLoading(false)
    }

    void loadWorkspace()
  }, [employeeId, reloadKey, scope])

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
  const handleNotificationRead = async (auditId: number) => {
    await markNotificationAsRead(auditId, employeeId)
    setNotifications((current) =>
      current.map((item) =>
        item.auditId === auditId ? { ...item, isRead: true } : item
      )
    )
  }

  return {
    auditLogs,
    defaultRoute: getDefaultRoute(role),
    employees,
    errorMessage,
    isLoading,
    markNotificationRead: handleNotificationRead,
    notifications,
    refetch,
    requests,
    role,
    searchRequests,
    summaryCards,
    user,
  }
}
