import { BudgetMetricCard } from "@/shared/components/dashboard/BudgetMetricCard"
import { PlannedVsActualBarChart } from "@/shared/components/dashboard/PlannedVsActualBarChart"
import { VarianceTrendChart } from "@/shared/components/dashboard/VarianceTrendChart"
import { useBudgetSummary, useMonthlyTrend } from "@/shared/hooks/useBudget"

function formatCurrency(value: number) {
  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  })
}

function Dashboard() {
  const summary = useBudgetSummary()
  const monthlyTrend = useMonthlyTrend()

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <BudgetMetricCard
          title="Total Planned Budget (₹)"
          value={formatCurrency(summary.summary?.totalPlanned || 0)}
          subtitle="Active projects only"
          change="Planned base"
          trend="positive"
        />
        <BudgetMetricCard
          title="Total Actual Spent (₹)"
          value={formatCurrency(summary.summary?.totalActual || 0)}
          subtitle="All projects included"
          change="ERP actuals"
          trend="neutral"
        />
        <BudgetMetricCard
          title="Overall Variance"
          value={formatCurrency(summary.summary?.variance || 0)}
          subtitle={`${summary.summary?.variancePct.toFixed(1)}% vs Planned`}
          change={summary.summary?.variance >= 0 ? "Savings" : "Deficit"}
          trend={summary.summary?.variance >= 0 ? "positive" : "negative"}
        />
        <BudgetMetricCard
          title="Active Projects"
          value={String(summary.summary?.activeProjects || 0)}
          subtitle="Active execution"
          change="Live count"
          trend="neutral"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PlannedVsActualBarChart data={monthlyTrend} />
        <VarianceTrendChart
          data={monthlyTrend.map((point) => ({
            label: point.label,
            variance: point.variance,
          }))}
        />
      </div>
    </div>
  )
}

export default Dashboard
