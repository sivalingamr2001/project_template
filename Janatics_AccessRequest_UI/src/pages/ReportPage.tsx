import { BudgetMetricCard } from "@/shared/components/dashboard/BudgetMetricCard"
import { PlannedVsActualBarChart } from "@/shared/components/dashboard/PlannedVsActualBarChart"
import { VarianceTrendChart } from "@/shared/components/dashboard/VarianceTrendChart"
import { Input } from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { apiService } from "@/shared/lib/api-client"
import {
  useBudgetSummary,
  useMonthlyTrend,
  useQuarterlyTrend,
  useYearlyTrend,
} from "@/shared/hooks/useBudget"
import { useMemo, useState } from "react"

function formatCurrency(value: number) {
  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  })
}

type BudgetRecordDto = {
  header: {
    budgetId: number
    employeeId: number
    projectCode: string
    productNo: string
    projectTitle: string
    createdOn: string
    modifiedOn: string
  }
  categories: {
    categoryId: number
    categoryName: string
    items: {
      itemId: number
      itemName: string
      planned: number
      actual: number
    }[]
  }[]
}

type PeriodOption = "monthly" | "quarterly" | "yearly" | "custom"

type ReportConfig = "summary" | "trend" | "product"

export default function ReportPage() {
  const [period, setPeriod] = useState<PeriodOption>("monthly")
  const [reportConfig, setReportConfig] = useState<ReportConfig>("summary")
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().slice(0, 10)
  })
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [productNo, setProductNo] = useState("")
  const [productBudget, setProductBudget] = useState<BudgetRecordDto | null>(null)
  const [productError, setProductError] = useState<string | null>(null)
  const [productLoading, setProductLoading] = useState(false)

  const { summary } = useBudgetSummary(
    period,
    period === "custom" ? fromDate : undefined,
    period === "custom" ? toDate : undefined
  )

  const monthlyTrend = useMonthlyTrend()
  const quarterlyTrend = useQuarterlyTrend()
  const yearlyTrend = useYearlyTrend()

  const trendData = useMemo(() => {
    if (period === "yearly") return yearlyTrend
    if (period === "quarterly") return quarterlyTrend
    return monthlyTrend
  }, [period, monthlyTrend, quarterlyTrend, yearlyTrend])

  const variance = summary?.variance ?? 0
  const variancePct = summary?.variancePct ?? 0

  const productTotals = productBudget
    ? productBudget.categories.reduce(
        (totals, category) => {
          const categoryPlanned = category.items.reduce(
            (sum, item) => sum + item.planned,
            0
          )
          const categoryActual = category.items.reduce(
            (sum, item) => sum + item.actual,
            0
          )

          return {
            planned: totals.planned + categoryPlanned,
            actual: totals.actual + categoryActual,
            variance: totals.variance + (categoryPlanned - categoryActual),
          }
        },
        { planned: 0, actual: 0, variance: 0 }
      )
    : { planned: 0, actual: 0, variance: 0 }

  const pageTitle =
    reportConfig === "product"
      ? "Product report"
      : reportConfig === "trend"
      ? "Trend overview"
      : "Summary report"

  const loadProductBudget = async () => {
    if (!productNo.trim()) {
      setProductError("Enter a product number to load the report.")
      setProductBudget(null)
      return
    }

    setProductLoading(true)
    setProductError(null)
    setProductBudget(null)

    try {
      const response = await apiService.get<BudgetRecordDto>(
        `/budgets/by-project/${encodeURIComponent(productNo.trim())}`
      )
      setProductBudget(response.data)
    } catch {
      setProductError(
        "No report found for that product number or product has no plan entry."
      )
    } finally {
      setProductLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Period
            </p>
            <Select
              value={period}
              onValueChange={(value) => setPeriod(value as PeriodOption)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {period === "custom" && (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  From date
                </p>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  To date
                </p>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Product number
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter product no."
                value={productNo}
                onChange={(event) => setProductNo(event.target.value)}
              />
              <Button
                onClick={loadProductBudget}
                disabled={productLoading}
                className="whitespace-nowrap"
              >
                {productLoading ? "Loading…" : "Load"}
              </Button>
            </div>
            {productError && (
              <p className="text-sm text-destructive">{productError}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-foreground">{pageTitle}</p>
            <p className="text-sm text-muted-foreground">
              Use header filters to switch views, load a product report, or update the period.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>Selected period: {period}</span>
            {period === "custom" ? (
              <span>
                {fromDate} → {toDate}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {reportConfig !== "product" ? (
        <>
          <div className="grid gap-4 lg:grid-cols-4">
            <BudgetMetricCard
              title="Budgeted"
              value={formatCurrency(summary?.totalPlanned ?? 0)}
              subtitle="Selected period"
              change="Planned"
              trend="positive"
            />
            <BudgetMetricCard
              title="Actuals"
              value={formatCurrency(summary?.totalActual ?? 0)}
              subtitle="Selected period"
              change="Spent"
              trend="neutral"
            />
            <BudgetMetricCard
              title="Variance"
              value={formatCurrency(variance)}
              subtitle={`${variancePct.toFixed(1)}%`}
              change={variance >= 0 ? "Under budget" : "Over budget"}
              trend={variance >= 0 ? "positive" : "negative"}
            />
            <BudgetMetricCard
              title="Active Projects"
              value={String(summary?.activeProjects ?? 0)}
              subtitle="Selected period"
              change="Projects"
              trend="neutral"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <PlannedVsActualBarChart data={trendData} />
            <VarianceTrendChart
              data={trendData.map((point) => ({ label: point.label, variance: point.variance }))}
            />
          </div>
        </>
      ) : productBudget ? (
        <div className="grid gap-4">
          <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Product budget overview
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-border bg-muted/50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Product
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {productBudget.header.productNo}
                  </p>
                </div>
                <div className="rounded-3xl border border-border bg-muted/50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Categories
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {productBudget.categories.length}
                  </p>
                </div>
                <div className="rounded-3xl border border-border bg-muted/50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Line items
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {productBudget.categories.reduce(
                      (sum, category) => sum + category.items.length,
                      0
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Planned total
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {formatCurrency(productTotals.planned)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Actual total
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {formatCurrency(productTotals.actual)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Variance
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {formatCurrency(productTotals.variance)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Product details
              </p>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground">Project</p>
                  <p>{productBudget.header.projectTitle}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Project code</p>
                  <p>{productBudget.header.projectCode}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Last updated</p>
                  <p>{new Date(productBudget.header.modifiedOn).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Budget category breakdown
            </p>
            <div className="mt-4 space-y-4">
              {productBudget.categories.map((category) => (
                <div key={category.categoryId} className="rounded-3xl border border-border bg-muted/50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{category.categoryName}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.items.length} items
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>
                        Planned {formatCurrency(category.items.reduce((sum, item) => sum + item.planned, 0))}
                      </p>
                      <p>
                        Actual {formatCurrency(category.items.reduce((sum, item) => sum + item.actual, 0))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
