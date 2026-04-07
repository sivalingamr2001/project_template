import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useApp } from "@/context/AppContext"
import {
  getPathForPage,
  getRouteStateFromLocation,
  isKnownRoute,
  ROUTES,
} from "./constants"

export function NavigationSync() {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    isAuthenticated,
    currentPage,
    selectedRequestId,
    selectedAccessItemId,
    setCurrentPage,
    setSelectedRequestId,
    setSelectedAccessItemId,
  } = useApp()

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    const routeState = getRouteStateFromLocation(
      location.pathname,
      location.search
    )

    if (!routeState) {
      return
    }

    if (routeState.page !== currentPage) {
      setCurrentPage(routeState.page)
    }

    if (routeState.selectedRequestId !== selectedRequestId) {
      setSelectedRequestId(routeState.selectedRequestId)
    }

    if (routeState.selectedAccessItemId !== selectedAccessItemId) {
      setSelectedAccessItemId(routeState.selectedAccessItemId)
    }
  }, [
    currentPage,
    isAuthenticated,
    location.pathname,
    location.search,
    selectedAccessItemId,
    selectedRequestId,
    setCurrentPage,
    setSelectedAccessItemId,
    setSelectedRequestId,
  ])

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    if (location.pathname !== ROUTES.root && !isKnownRoute(location.pathname)) {
      return
    }

    const nextPath = getPathForPage(currentPage, {
      selectedRequestId,
      selectedAccessItemId,
    })
    const currentPath = `${location.pathname}${location.search}`

    if (nextPath !== currentPath) {
      navigate(nextPath, { replace: true })
    }
  }, [
    currentPage,
    isAuthenticated,
    location.pathname,
    location.search,
    navigate,
    selectedAccessItemId,
    selectedRequestId,
  ])

  return null
}
