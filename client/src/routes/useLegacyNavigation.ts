import { useNavigate } from "react-router-dom"
import { useApp, type Page } from "@/context/AppContext"
import { buildRequestDetailPath, getPathForPage, pageRouteMap } from "./constants"

interface NavigationOptions {
  replace?: boolean
}

export function useLegacyNavigation() {
  const navigate = useNavigate()
  const {
    setCurrentPage,
    setSelectedRequestId,
    setSelectedAccessItemId,
  } = useApp()

  function goTo(page: Page, options?: NavigationOptions) {
    setCurrentPage(page)

    if (page !== "EMPLOYEE_REQUEST_DETAIL") {
      setSelectedRequestId(undefined)
      setSelectedAccessItemId(undefined)
    }

    navigate(getPathForPage(page), { replace: options?.replace })
  }

  function goToRequestDetail(
    requestId: number,
    accessItemId?: number,
    options?: NavigationOptions
  ) {
    setSelectedRequestId(requestId)
    setSelectedAccessItemId(accessItemId)
    setCurrentPage("EMPLOYEE_REQUEST_DETAIL")
    navigate(buildRequestDetailPath(requestId, accessItemId), {
      replace: options?.replace,
    })
  }

  return {
    goTo,
    goToRequestDetail,
    pageRouteMap,
  }
}
