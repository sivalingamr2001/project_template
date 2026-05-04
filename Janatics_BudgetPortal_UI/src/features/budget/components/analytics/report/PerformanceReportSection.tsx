import { Badge } from "@/shared/components/ui/badge"
import { Card } from "@/shared/components/ui/card"
import type { BudgetTotals } from "@/features/budget/types"
import { ReportHeader } from "./ReportHeader"
import { ExecutiveSummary } from "./ExecutiveSummary"
import { TrendLineChart } from "./TrendLineChart"
import { DeepDiveInsights } from "./DeepDiveInsights"
import { CategoryStackedChart } from "./CategoryStackedChart"
import { VarianceScatterPlot } from "./VarianceScatterPlot"

interface AnalyticsCategoryData {
  category: string
  planned: number
  actual: number
  variance: number
  utilization: number
}

export function PerformanceReportSection({
  totals,
  categories,
}: {
  totals: BudgetTotals
  categories: AnalyticsCategoryData[]
}) {
  return (
    <Card className="flex min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border/70 px-5 py-4">
        <Badge
          className="border-primary/20 bg-primary/10 text-primary"
          variant="secondary"
        >
          Quarterly Performance Report
        </Badge>
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-auto p-5">
        <ReportHeader totals={totals} lastUpdated={new Date().toISOString()} />
        <ExecutiveSummary totals={totals} categories={categories} />
        <div className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-5">
            <TrendLineChart totals={totals} />
            <DeepDiveInsights categories={categories} />
          </div>
          <div className="space-y-5">
            <CategoryStackedChart categories={categories} />
            <VarianceScatterPlot categories={categories} />
          </div>
        </div>
      </div>
    </Card>
  )
}
