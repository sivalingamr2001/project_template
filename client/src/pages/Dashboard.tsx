import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useBudgetSummary, useMonthlyTrend, useProjectBudgets } from '@/hooks/useBudgetData'
import { BudgetMetricCard } from '@/components/dashboard/BudgetMetricCard'
import { PlannedVsActualBarChart } from '@/components/dashboard/PlannedVsActualBarChart'
import { VarianceTrendChart } from '@/components/dashboard/VarianceTrendChart'
import { TopVarianceProjects } from '@/components/dashboard/TopVarianceProjects'
import { RecentBudgetActivity } from '@/components/dashboard/RecentBudgetActivity'

function formatCurrency(value: number) {
  return value.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  })
}

function Dashboard() {
  const summary = useBudgetSummary()
  const budgets = useProjectBudgets()
  const monthlyTrend = useMonthlyTrend()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-700 bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">Budget Analysis Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-100">Overview</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/reports">
            <Button variant="outline">View Reports →</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <BudgetMetricCard
          title="Total Planned Budget (₹)"
          value={formatCurrency(summary.totalPlanned)}
          subtitle="Active NPD projects only"
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
          title="Active NPD Projects"
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

      <div className="grid gap-4 xl:grid-cols-2">
        <TopVarianceProjects budgets={budgets} />
        <RecentBudgetActivity />
      </div>
    </div>
  )
}

export default Dashboard
