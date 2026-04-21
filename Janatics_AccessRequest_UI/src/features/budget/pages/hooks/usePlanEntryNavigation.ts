import { useEffect, useState } from "react"
import { useNavigationBlock } from "@/providers/NavigationBlockProvider"

interface UsePlanEntryNavigationReturn {
  showConfirmationDialog: boolean
  setShowConfirmationDialog: (show: boolean) => void
  pendingNavigation: string | null
  setPendingNavigation: (path: string | null) => void
}

export function usePlanEntryNavigation(
  hasUnsavedChanges: boolean
): UsePlanEntryNavigationReturn {
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  )
  const { onBlock, onUnblock } = useNavigationBlock()

  // Setup beforeunload handler
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        setShowConfirmationDialog(true)
      }
    }

    if (hasUnsavedChanges) {
      window.addEventListener("beforeunload", handleBeforeUnload)
      window.addEventListener("popstate", handlePopState)
      onBlock()
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", handlePopState)
      if (hasUnsavedChanges) {
        onUnblock()
      }
    }
  }, [hasUnsavedChanges, onBlock, onUnblock])

  return {
    showConfirmationDialog,
    setShowConfirmationDialog,
    pendingNavigation,
    setPendingNavigation,
  }
}
