import { useEffect, useMemo, useState } from "react"

import { useAuth } from "@/context/AuthContext"

import type { AccessRequest, NotificationItem, QueueMode, AppRole } from "../types"
import {
  getDefaultRoute,
  getRequestsByMode,
  getSummaryCards,
} from "../utils/accessSelectors"
import {
  fetchAccessRequests,
  fetchNotifications,
  markNotificationRead,
} from "../utils/requestApi"

export function useAccessWorkspace(mode: QueueMode = "dashboard") {
  const { user } = useAuth()
  const userId = user?.userId ?? 0
  const role = (user?.role as AppRole) || "User"
  const [apiRequests, setApiRequests] = useState<AccessRequest[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!userId) return

    setIsLoading(true)
    void (async () => {
      try {
        const [requests, notificationsResponse] = await Promise.all([
          fetchAccessRequests(userId),
          fetchNotifications(userId, 1, 50),
        ])

        setApiRequests(requests)
        setNotifications(notificationsResponse.data)
        setErrorMessage(null)
      } catch (error) {
        setApiRequests([])
        setNotifications([])
        if (error instanceof Error) {
          setErrorMessage(error.message)
        } else {
          setErrorMessage("Unable to load workspace data.")
        }
      } finally {
        setIsLoading(false)
      }
    })()
  }, [userId, reloadKey])

  const requests = useMemo(
    () => getRequestsByMode(apiRequests, mode, userId),
    [apiRequests, userId, mode]
  )
  const summaryCards = useMemo(
    () => getSummaryCards(apiRequests, userId),
    [apiRequests, userId]
  )
  const searchRequests = (searchTerm: string) =>
    requests.filter((request) =>
      JSON.stringify(request).toLowerCase().includes(searchTerm.toLowerCase())
    )
  const refetch = () => setReloadKey((current) => current + 1)

  const markNotificationAsRead = async (auditId: number) => {
    if (!userId) return
    await markNotificationRead(auditId, userId)
    setNotifications((current) =>
      current.map((item) =>
        item.auditId === auditId ? { ...item, isRead: true } : item
      )
    )
  }

  return {
    defaultRoute: getDefaultRoute(role),
    errorMessage,
    isLoading,
    markNotificationAsRead,
    notifications: notifications.filter((item) => item.recipientRole === role),
    refetch,
    requests,
    role,
    searchRequests,
    summaryCards,
    user,
  }
}
