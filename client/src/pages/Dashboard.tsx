import { BudgetMetricCard } from '@/components/dashboard/BudgetMetricCard'
import { PlannedVsActualBarChart } from '@/components/dashboard/PlannedVsActualBarChart'
import { VarianceTrendChart } from '@/components/dashboard/VarianceTrendChart'
import { useBudgetSummary, useMonthlyTrend } from '@/hooks/useBudgetData'

function formatCurrency(value: number) {
  return value.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
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
          value={formatCurrency(summary.totalPlanned)}
          subtitle="Active projects only"
          change="Planned base"
          trend="positive"
        />
        <BudgetMetricCard
          title="Total Actual Spent (₹)"
          value={formatCurrency(summary.totalActual)}
          subtitle="All projects included"
          change="ERP actuals"
          trend="neutral"
        />
        <BudgetMetricCard
          title="Overall Variance"
          value={formatCurrency(summary.variance)}
          subtitle={`${summary.variancePct.toFixed(1)}% variance`}
          change={summary.variance >= 0 ? 'Under budget' : 'Over budget'}
          trend={summary.variance >= 0 ? 'positive' : 'negative'}
        />
        <BudgetMetricCard
          title="Active Projects"
          value={String(summary.activeProjects)}
          subtitle="Active execution"
          change="Live count"
          trend="neutral"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PlannedVsActualBarChart data={monthlyTrend} />
        <VarianceTrendChart data={monthlyTrend.map((point) => ({ label: point.label, variance: point.variance }))} />
      </div>

      {/* <div className="grid gap-4 xl:grid-cols-2">
        <TopVarianceProjects budgets={budgets} />
        <RecentBudgetActivity />
      </div> */}
    </div>
  )
}

export default Dashboard
