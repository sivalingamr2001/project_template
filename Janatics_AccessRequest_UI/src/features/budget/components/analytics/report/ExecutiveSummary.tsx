import { formatINR } from "@/shared/utils/utils"
import type { BudgetTotals } from "@/features/budget/types"

interface ExecutiveSummaryProps {
  totals: BudgetTotals
  categories: {
    category: string
    planned: number
    actual: number
    variance: number
    utilization: number
  }[]
}

export function ExecutiveSummary({
  totals,
  categories,
}: ExecutiveSummaryProps) {
  const topVariance = categories.reduce(
    (prev, next) =>
      Math.abs(next.variance) > Math.abs(prev.variance) ? next : prev,
    categories[0] ?? {
      category: "N/A",
      planned: 0,
      actual: 0,
      variance: 0,
      utilization: 0,
    }
  )
  const overBudgetCount = categories.filter(
    (item) => item.utilization > 100
  ).length
  const performancePhrase =
    totals.totalActual > totals.totalPlanned ? "above plan" : "below plan"

  return (
    <div className="rounded-3xl border border-border/70 bg-background/50 p-5">
      <div className="text-sm font-semibold text-foreground">
        Executive Summary
      </div>
      <div className="mt-4 space-y-3 text-sm text-muted-foreground">
        <div className="flex items-start gap-3">
          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
          <p>
            Total actual spend is <strong>{performancePhrase}</strong>, with a
            variance of <strong>{formatINR(totals.variance)}</strong> driven by{" "}
            <strong>{topVariance.category}</strong>.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-muted-foreground" />
          <p>
            {overBudgetCount} category{overBudgetCount === 1 ? "" : "ies"} are
            currently over budget, signaling a need for tighter category
            controls.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-500" />
          <p>
            Trend analysis suggests spend momentum is stabilizing, with the next
            period dependent on corrective oversight for high-variance segments.
          </p>
        </div>
      </div>
    </div>
  )
}
