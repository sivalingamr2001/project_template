import { ArrowLeft } from "lucide-react"
import { BudgetAnalyticsSection } from "../components/analytics/BudgetAnalyticsSection"
import { Button } from "@/shared/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useBudget } from "@/providers/Budget/BudgetProvider"

function Analytics() {
  const navigate = useNavigate()
  const { activeRecord, loading, error } = useBudget()

  if (loading) {
    return <div className="flex justify-center p-8">Loading analytics...</div>
  }

  if (error) {
    return (
      <div className="flex justify-center p-8 text-red-500">Error: {error}</div>
    )
  }

  if (!activeRecord) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6 py-12">
        <div className="max-w-xl rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <h1 className="mb-4 text-2xl font-semibold text-foreground">
            No budget selected
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Select a budget record from the plan entry page to view analytics.
          </p>
          <Button onClick={() => navigate("/budget/plan-entry")}>
            Go to Plan Entry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="m-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => {
              navigate("/budget/plan-entry")
            }}
          >
            <ArrowLeft className="mr-2 inline-block size-5 text-muted-foreground" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Budget Variance & Analysis
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeRecord.projectHeader.projectCode} ·{" "}
              {activeRecord.projectHeader.productName} ·{" "}
              {activeRecord.projectHeader.phase}
            </p>
          </div>
        </div>
      </div>
      <BudgetAnalyticsSection record={activeRecord} />
    </div>
  )
}

export default Analytics
