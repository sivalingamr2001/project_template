import type { Page } from "@/context/AppContext"
import type { UserRole } from "@/lib/types"
import { matchPath } from "react-router-dom"

export const ROUTES = {
  root: "/",
  dashboard: "/dashboard",
  myRequests: "/my-requests",
  requestDetailBase: "/requests",
  requestDetail: "/requests/:requestId",
  profile: "/profile",
  hodApprovals: "/approval",
  hodHistory: "/approval/history",
  hodLookup: "/approval/lookup",
  hodAllRequests: "/approval/all-requests",
  itQueue: "/it/queue",
  itActiveAccess: "/it/active-access",
  itLookup: "/it/lookup",
  itAuditLog: "/it/audit-log",
  itAllRequests: "/it/all-requests",
} as const

export const pageRouteMap: Record<Page, string> = {
  LOGIN: ROUTES.root,
  EMPLOYEE_DASHBOARD: ROUTES.dashboard,
  EMPLOYEE_REQUESTS: ROUTES.myRequests,
  EMPLOYEE_REQUEST_DETAIL: ROUTES.requestDetailBase,
  USER_PROFILE: ROUTES.profile,
  HOD_APPROVALS: ROUTES.hodApprovals,
  HOD_HISTORY: ROUTES.hodHistory,
  HOD_LOOKUP: ROUTES.hodLookup,
  HOD_ALL_REQUESTS: ROUTES.hodAllRequests,
  IT_QUEUE: ROUTES.itQueue,
  IT_ACTIVE_ACCESS: ROUTES.itActiveAccess,
  IT_LOOKUP: ROUTES.itLookup,
  IT_AUDIT_LOG: ROUTES.itAuditLog,
  IT_ALL_REQUESTS: ROUTES.itAllRequests,
}

export interface NavigationTargetOptions {
  selectedRequestId?: number
  selectedAccessItemId?: number
}

export interface RouteState extends NavigationTargetOptions {
  page: Page
}

const orderedRouteMatchers: Array<{ path: string; page: Page }> = [
  { path: ROUTES.requestDetail, page: "EMPLOYEE_REQUEST_DETAIL" },
  { path: ROUTES.requestDetailBase, page: "EMPLOYEE_REQUEST_DETAIL" },
  { path: ROUTES.dashboard, page: "EMPLOYEE_DASHBOARD" },
  { path: ROUTES.myRequests, page: "EMPLOYEE_REQUESTS" },
  { path: ROUTES.profile, page: "USER_PROFILE" },
  { path: ROUTES.hodApprovals, page: "HOD_APPROVALS" },
  { path: ROUTES.hodHistory, page: "HOD_HISTORY" },
  { path: ROUTES.hodLookup, page: "HOD_LOOKUP" },
  { path: ROUTES.hodAllRequests, page: "HOD_ALL_REQUESTS" },
  { path: ROUTES.itQueue, page: "IT_QUEUE" },
  { path: ROUTES.itActiveAccess, page: "IT_ACTIVE_ACCESS" },
  { path: ROUTES.itLookup, page: "IT_LOOKUP" },
  { path: ROUTES.itAuditLog, page: "IT_AUDIT_LOG" },
  { path: ROUTES.itAllRequests, page: "IT_ALL_REQUESTS" },
]

export function buildRequestDetailPath(
  requestId?: number,
  accessItemId?: number
) {
  const pathname = requestId
    ? `${ROUTES.requestDetailBase}/${requestId}`
    : ROUTES.requestDetailBase

  if (!accessItemId) {
    return pathname
  }

  return `${pathname}?itemId=${accessItemId}`
}

export function getPathForPage(
  page: Page,
  options: NavigationTargetOptions = {}
) {
  if (page === "EMPLOYEE_REQUEST_DETAIL") {
    return buildRequestDetailPath(
      options.selectedRequestId,
      options.selectedAccessItemId
    )
  }

  return pageRouteMap[page]
}

export function getDefaultPathForRole(role: UserRole | null) {
  if (role === "HOD") {
    return pageRouteMap.HOD_APPROVALS
  }

  if (role === "IT") {
    return pageRouteMap.IT_QUEUE
  }

  return pageRouteMap.EMPLOYEE_DASHBOARD
}

export function getRouteStateFromLocation(
  pathname: string,
  search: string
): RouteState | null {
  for (const route of orderedRouteMatchers) {
    const match = matchPath({ path: route.path, end: true }, pathname)
    if (!match) {
      continue
    }

    if (route.page === "EMPLOYEE_REQUEST_DETAIL") {
      const itemId = new URLSearchParams(search).get("itemId")
      const requestId = Number(match.params.requestId)
      const parsedItemId = itemId ? Number(itemId) : undefined

      return {
        page: route.page,
        selectedRequestId: Number.isFinite(requestId) ? requestId : undefined,
        selectedAccessItemId:
          parsedItemId !== undefined && Number.isFinite(parsedItemId)
            ? parsedItemId
            : undefined,
      }
    }

    return { page: route.page }
  }

  return null
}

export function isKnownRoute(pathname: string) {
  return orderedRouteMatchers.some((route) =>
    matchPath({ path: route.path, end: true }, pathname)
  )
}
