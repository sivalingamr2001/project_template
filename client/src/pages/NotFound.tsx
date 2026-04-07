import { Button } from "@/components/ui/button"
import { useApp } from "@/context/AppContext"
import { useLegacyNavigation } from "@/routes/useLegacyNavigation"

export function NotFound() {
  const { currentRole } = useApp()
  const { goTo } = useLegacyNavigation()

  const handleBackHome = () => {
    if (currentRole === "HOD") {
      goTo("HOD_APPROVALS")
      return
    }

    if (currentRole === "IT") {
      goTo("IT_QUEUE")
      return
    }

    goTo("EMPLOYEE_DASHBOARD")
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          404
        </p>
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          The URL does not match a migrated screen yet. You can safely return to
          your default dashboard.
        </p>
      </div>
      <Button onClick={handleBackHome}>Go to dashboard</Button>
    </div>
  )
}
