import planEntryTemplate from "@/data/planEntryTemplate.json"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { BudgetMetricCard } from "@/shared/components/dashboard/BudgetMetricCard"
import { useBudgetSummary } from "@/shared/hooks/useBudget"

function formatCurrency(value: number) {
  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  })
}

export default function PlanEntry() {
  const { summary } = useBudgetSummary()
  const variance = summary?.variance ?? 0
  const variancePct = summary?.variancePct ?? 0

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <BudgetMetricCard
          title="Planned Budget"
          value={formatCurrency(summary?.totalPlanned ?? 0)}
          subtitle="Monthly summary"
          change="From API"
          trend="positive"
        />
        <BudgetMetricCard
          title="Actual Spend"
          value={formatCurrency(summary?.totalActual ?? 0)}
          subtitle="Live ERP values"
          change="From API"
          trend="neutral"
        />
        <BudgetMetricCard
          title="Variance"
          value={formatCurrency(variance)}
          subtitle={`${variancePct.toFixed(1)}% vs planned`}
          change={variance >= 0 ? "Under budget" : "Over budget"}
          trend={variance >= 0 ? "positive" : "negative"}
        />
        <BudgetMetricCard
          title="Active Projects"
          value={String(summary?.activeProjects ?? 0)}
          subtitle="Current live budgets"
          change="Count"
          trend="neutral"
        />
      </div>

      <Card className="border border-border bg-card shadow-sm">
        <CardHeader>
          <div>
            <CardTitle>Budget Entry Template</CardTitle>
            <p className="text-sm text-muted-foreground">
              Use the budget template categories below as a starting point for
              new plan entries.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {planEntryTemplate.map((category) => (
            <div
              key={category.category}
              className="rounded-2xl border border-border p-4"
            >
              <p className="mb-3 text-sm font-semibold text-foreground">
                {category.category}
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {category.items.map((item) => (
                  <li key={item} className="rounded-lg bg-muted px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
