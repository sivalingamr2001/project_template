import { useCallback, useEffect, useState } from "react"
import type {
  AccessRequest,
  AccessTypes,
  HODAccessTypes,
  Notification,
  User,
} from "../../lib/types"
import { useApp } from "@/context/AppContext"
import {
  createAccessRequest,
  fetchDashboardData,
  fetchUsers,
  revokeAccessItem,
  sendNotificationToRequester,
  type AccessRequestFormPayload,
  updateAccessApproval,
} from "../../lib/access-request-api"
import type { DataContextType } from "./types"

export function useDataContextLogic(): DataContextType {
  const { currentRole, currentUser, isAuthenticated } = useApp()
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [users, setUsers] = useState<User[]>([])

  const refreshData = useCallback(async () => {
    if (!isAuthenticated) {
      setRequests([])
      setNotifications([])
      setUsers([])
      return
    }

    const [dashboard, directory] = await Promise.all([
      fetchDashboardData(),
      fetchUsers(),
    ])
    setRequests(dashboard.requests)
    setNotifications(dashboard.notifications)
    setUsers(directory)
  }, [isAuthenticated])

  useEffect(() => {
    void refreshData()
  }, [refreshData, currentRole])

  const addRequest = async (
    request: AccessRequest | AccessRequestFormPayload
  ) => {
    if ("details" in request) {
      const created = await createAccessRequest(request, currentUser)
      setRequests((current) => [
        created,
        ...current.filter((item) => item.id !== created.id),
      ])
      return
    }

    setRequests((current) => [
      request,
      ...current.filter((item) => item.id !== request.id),
    ])
  }

  const updateRequest = (updatedRequest: AccessRequest) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === updatedRequest.id ? updatedRequest : request
      )
    )
  }

  const approveItem = async (
    requestId: number,
    itemId: number,
    comment?: string,
    _confirmedType?: AccessTypes,
    approvedType?: HODAccessTypes,
    durationDays?: number
  ) => {
    if (!currentRole || currentRole === "User") return false

    try {
      await updateAccessApproval({
        requestId,
        detailId: itemId,
        approvalLevel: currentRole,
        status: "Approved",
        comments: comment,
        approvedType,
        durationDays,
      })

      const notificationMessage = `${currentRole} approved your request for ${requestId}${durationDays ? ` for ${durationDays} days` : ""}`
      await sendNotificationToRequester(
        requestId,
        itemId,
        "approved",
        currentRole,
        notificationMessage
      )

      await refreshData()

      console.log(
        `[${currentRole}] Approved item ${itemId} for request ${requestId}`,
        {
          durationDays,
          comment,
          approvedType,
        }
      )

      return true
    } catch (error) {
      console.error("Error approving item:", error)
      throw error
    }
  }

  const rejectItem = async (
    requestId: number,
    itemId: number,
    comment?: string
  ) => {
    if (!currentRole || currentRole === "User") return false

    try {
      await updateAccessApproval({
        requestId,
        detailId: itemId,
        approvalLevel: currentRole,
        status: "Rejected",
        comments: comment,
      })

      const notificationMessage = `${currentRole} rejected your request for item ${itemId}${comment ? `: ${comment}` : ""}`
      await sendNotificationToRequester(
        requestId,
        itemId,
        "rejected",
        currentRole,
        notificationMessage
      )

      await refreshData()

      console.log(
        `[${currentRole}] Rejected item ${itemId} for request ${requestId}`,
        {
          reason: comment,
        }
      )

      return true
    } catch (error) {
      console.error("Error rejecting item:", error)
      throw error
    }
  }

  const revokeItem = async (
    requestId: number,
    itemId: number,
    note?: string
  ) => {
    const updated = await revokeAccessItem(requestId, itemId, note)
    updateRequest(updated)
  }

  const extendItemExpiry = (
    _requestId: number,
    _itemId: number,
    _days: number
  ) => {
    console.warn("Extend expiry is not implemented for the current backend.")
  }

  const markNotificationAsRead = (notificationId: number) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  return {
    requests,
    notifications,
    users,
    setRequests,
    refreshData,
    addRequest,
    updateRequest,
    approveItem,
    rejectItem,
    revokeItem,
    extendItemExpiry,
    markNotificationAsRead,
  }
}
