import {
  sumIncludedActual,
  sumIncludedPlanned,
} from "@/features/budget/components/plan-entry/utils/budgetTableUtils"
import type { BudgetRecordResponse } from "@/features/budget/types"
import { applyTemplateMetadataToBudgetData } from "@/features/budget/utils/budgetTemplates"
import { exportBudgetWorkbook } from "@/features/budget/utils/exportBudgetWorkbook"
import { AdvancedViewPicker } from "@/shared/components/dashboard/AdvancedViewPicker"
import { BudgetMetricCard } from "@/shared/components/dashboard/BudgetMetricCard"
import { PlannedVsActualBarChart } from "@/shared/components/dashboard/PlannedVsActualBarChart"
import { VarianceTrendChart } from "@/shared/components/dashboard/VarianceTrendChart"
import { Button } from "@/shared/components/ui/button"
import { Calendar } from "@/shared/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"
import {
  useBudgetSummary,
  useMonthlyTrend,
  useQuarterlyTrend,
  useYearlyTrend,
} from "@/shared/hooks/useBudget"
import { apiService } from "@/shared/lib/api-client"
import { format } from "date-fns"
import {
  ArrowRight,
  Calendar as CalendarIcon,
  FileText,
  LayoutDashboard,
  Loader2,
  Search,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"

const formatCurrency = (val: number) =>
  val.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  })

export default function ReportPage() {
  const location = useLocation()
  // --- State ---
  const [period, setPeriod] = useState<string>("2025-2026")
  const [productNo, setProductNo] = useState("")
  const [reportConfig, setReportConfig] = useState<"summary" | "product">(
    "summary"
  )
  const [team, setTeam] = useState<string>("")
  const [date, setDate] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  })

  const [productLoading, setProductLoading] = useState(false)
  const [productExporting, setProductExporting] = useState(false)
  const [productBudget, setProductBudget] =
    useState<BudgetRecordResponse | null>(null)
  const [productError, setProductError] = useState<string | null>(null)

  const summary = useBudgetSummary(
    period,
    period === "custom" ? format(date.from, "yyyy-MM-dd") : undefined,
    period === "custom" ? format(date.to, "yyyy-MM-dd") : undefined,
    team || undefined
  )

  const monthlyTrend = useMonthlyTrend(team)
  const quarterlyTrend = useQuarterlyTrend(team)
  const yearlyTrend = useYearlyTrend(team)

  const trendData = useMemo(() => {
    if (period.includes("-")) return yearlyTrend
    if (period.startsWith("Q")) return quarterlyTrend
    return monthlyTrend
  }, [period, monthlyTrend, quarterlyTrend, yearlyTrend])

  const productTotals = useMemo(() => {
    if (!productBudget) {
      return { planned: 0, actual: 0, variance: 0 }
    }

    const enrichedCategories = applyTemplateMetadataToBudgetData(
      productBudget.categories.map((category) => ({
        categoryId: category.categoryId,
        category: category.categoryName,
        items: category.items.map((item) => ({
          itemId: item.itemId,
          name: item.itemName,
          planned: item.planned,
          actual: item.actual,
        })),
      })),
      productBudget.templateStructure
    )

    const planned = enrichedCategories.reduce(
      (sum, category) => sum + sumIncludedPlanned(category.items),
      0
    )

    const actual = enrichedCategories.reduce(
      (sum, category) => sum + sumIncludedActual(category.items),
      0
    )

    return {
      planned,
      actual,
      variance: planned - actual,
    }
  }, [productBudget])

  const productCategoryChartData = useMemo(() => {
    if (!productBudget) {
      return []
    }

    const enrichedCategories = applyTemplateMetadataToBudgetData(
      productBudget.categories.map((category) => ({
        categoryId: category.categoryId,
        category: category.categoryName,
        items: category.items.map((item) => ({
          itemId: item.itemId,
          name: item.itemName,
          planned: item.planned,
          actual: item.actual,
        })),
      })),
      productBudget.templateStructure
    )

    return enrichedCategories.map((category) => {
      const planned = sumIncludedPlanned(category.items)
      const actual = sumIncludedActual(category.items)

      return {
        label: category.category,
        planned,
        actual,
        variance: planned - actual,
      }
    })
  }, [productBudget])

  const productBudgetCategories = useMemo(() => {
    if (!productBudget) {
      return []
    }

    return applyTemplateMetadataToBudgetData(
      productBudget.categories.map((category) => ({
        categoryId: category.categoryId,
        category: category.categoryName,
        items: category.items.map((item) => ({
          itemId: item.itemId,
          name: item.itemName,
          planned: item.planned,
          actual: item.actual,
        })),
      })),
      productBudget.templateStructure
    )
  }, [productBudget])

  const loadProductBudgetByBudgetId = async (budgetId: number) => {
    setProductLoading(true)
    setProductError(null)
    setReportConfig("product")

    try {
      const response = await apiService.get<BudgetRecordResponse>(
        `/budgets/${budgetId}`
      )
      setProductBudget(response.data)
      setProductNo(response.data.header.productNo)
    } catch (error) {
      console.error("Failed to load budget report", error)
      setProductBudget(null)
      setProductError("Unable to load the selected budget report.")
    } finally {
      setProductLoading(false)
    }
  }

  const loadProductBudget = async () => {
    const trimmedProductNo = productNo.trim()
    if (!trimmedProductNo) return

    setProductLoading(true)
    setProductError(null)
    setReportConfig("product")

    try {
      const response = await apiService.get<BudgetRecordResponse>(
        `/budgets/by-project/${encodeURIComponent(trimmedProductNo)}`
      )
      setProductBudget(response.data)
    } catch (error) {
      console.error("Failed to load product budget", error)
      setProductBudget(null)
      setProductError("Unable to find budget for this product number.")
    } finally {
      setProductLoading(false)
    }
  }

  useEffect(() => {
    const reportState = location.state as {
      budgetId?: number
      productNo?: string
    } | null

    if (reportState?.budgetId) {
      void loadProductBudgetByBudgetId(reportState.budgetId)
      return
    }

    if (reportState?.productNo) {
      setProductNo(reportState.productNo)
    }
  }, [location.state])

  const handleExportProductReport = async () => {
    if (!productBudget?.header.budgetId) {
      setProductError("Load a product report before exporting.")
      return
    }

    try {
      setProductExporting(true)
      await exportBudgetWorkbook(productBudget.header.budgetId)
    } catch (error) {
      console.error("Failed to export product report", error)
      setProductError("Unable to export the product cost report.")
    } finally {
      setProductExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 bg-background p-0">
      {/* 🟢 SLEEK HEADER FILTERS */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            {reportConfig === "product" ? (
              <FileText className="h-6 w-6 text-primary" />
            ) : (
              <LayoutDashboard className="h-6 w-6 text-primary" />
            )}
            {reportConfig === "product" ? "Product Report" : "Budget Summary"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {reportConfig === "product"
              ? `Detailed financial breakdown for ${productNo || "selected product"}`
              : "Overall analytics for live projects and tracking."}
          </p>
          {productError && reportConfig === "product" && (
            <p className="mt-2 text-sm text-rose-600">{productError}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 self-end">
          <div className="flex items-center gap-2 rounded-full border bg-card pl-4 shadow-sm transition-all focus-within:ring-1 focus-within:ring-primary/50">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              placeholder="Product Number..."
              value={productNo}
              onChange={(e) => setProductNo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadProductBudget()}
              className="w-24 bg-transparent text-xs outline-none md:w-32"
            />
            <Button
              size="sm"
              onClick={loadProductBudget}
              disabled={productLoading}
              className="h-7 rounded-full px-4 text-[11px] font-bold tracking-wider uppercase"
            >
              {productLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Load"
              )}
            </Button>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportProductReport}
            disabled={!productBudget?.header.budgetId || productExporting}
            className="h-7 rounded-full px-4 text-[11px] font-bold tracking-wider uppercase"
          >
            {productExporting ? "Exporting..." : "Export"}
          </Button>

          <div className="flex items-center gap-2 rounded-full border bg-card pl-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                {period}
              </span>
            </div>

            {period === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 rounded-full px-3 text-[10px]"
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {format(date.from, "MMM dd")} - {format(date.to, "MMM dd")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={{ from: date.from, to: date.to }}
                    onSelect={(range: any) =>
                      range?.from && range?.to && setDate(range)
                    }
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            )}

            <AdvancedViewPicker
              period={period}
              selectedTeam={team}
              onPeriodChange={setPeriod}
              onTeamChange={setTeam}
            />
          </div>
        </div>
      </div>

      {/* 📊 CONTENT SECTION */}
      {reportConfig !== "product" ? (
        <div className="space-y-2">
          <div className="mb-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <BudgetMetricCard
              title="Budgeted"
              value={formatCurrency(summary.summary?.totalPlanned ?? 0)}
              subtitle="Selected period"
              change="Planned"
              trend="positive"
            />
            <BudgetMetricCard
              title="Actuals"
              value={formatCurrency(summary.summary?.totalActual ?? 0)}
              subtitle="Selected period"
              change="Spent"
              trend="neutral"
            />
            <BudgetMetricCard
              title="Variance"
              value={formatCurrency(
                (summary.summary?.totalPlanned ?? 0) -
                  (summary.summary?.totalActual ?? 0)
              )}
              subtitle="vs Planned"
              change="Difference"
              trend="positive"
            />
            <BudgetMetricCard
              title="Active Projects"
              value={String(summary.summary?.activeProjects ?? 0)}
              subtitle="Execution"
              change="Count"
              trend="neutral"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border bg-card p-2 shadow-sm transition-all hover:shadow-md">
              <PlannedVsActualBarChart data={trendData} />
            </div>
            <div className="rounded-3xl border bg-card p-2 shadow-sm transition-all hover:shadow-md">
              <VarianceTrendChart
                data={trendData.map((p: any) => ({
                  label: p.label,
                  variance: p.variance,
                }))}
              />
            </div>
          </div>
        </div>
      ) : productBudget ? (
        <div className="grid gap-6">
          {/* Product Overview Section */}
          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
                Product budget overview
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border bg-muted/30 p-4">
                  <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    Planned
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {formatCurrency(productTotals.planned)}
                  </p>
                </div>
                <div className="rounded-2xl border bg-muted/30 p-4">
                  <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    Actual
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {formatCurrency(productTotals.actual)}
                  </p>
                </div>
                <div className="rounded-2xl border bg-muted/30 p-4">
                  <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    Variance
                  </p>
                  <p className="mt-1 text-xl font-bold text-primary">
                    {formatCurrency(productTotals.variance)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
                Project Details
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Product Name</p>
                  <p className="text-sm font-semibold">
                    {productBudget.header.productName ??
                      productBudget.header.projectTitle}
                  </p>
                </div>
                <div className="flex justify-between border-t pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Project Number
                    </p>
                    <p className="text-sm font-semibold">
                      {productBudget.header.projectNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Updated</p>
                    <p className="text-sm font-semibold">
                      {new Date(
                        productBudget.header.modifiedOn
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border bg-card p-2 shadow-sm transition-all hover:shadow-md">
              <PlannedVsActualBarChart data={productCategoryChartData} />
            </div>
            <div className="rounded-3xl border bg-card p-2 shadow-sm transition-all hover:shadow-md">
              <VarianceTrendChart
                data={productCategoryChartData.map((point) => ({
                  label: point.label,
                  variance: point.variance,
                }))}
              />
            </div>
          </div>

          {/* Categories Section */}
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <p className="mb-4 text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Budget category breakdown
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {productBudgetCategories.map((category) => {
                const planned = sumIncludedPlanned(category.items)
                const actual = sumIncludedActual(category.items)
                const variance = planned - actual

                return (
                  <div
                    key={category.categoryId}
                    className="group rounded-2xl border bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-primary">
                        {category.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {category.items.length} line items
                      </span>
                      <div className="mt-3 grid gap-3 border-t border-border/50 pt-3 text-xs">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-muted-foreground">Planned</p>
                            <p className="font-bold">
                              {formatCurrency(planned)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground">Actual</p>
                            <p className="font-bold">
                              {formatCurrency(actual)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-muted-foreground">Variance</p>
                            <p className="font-bold text-primary">
                              {formatCurrency(variance)}
                            </p>
                          </div>
                          <ArrowRight className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex h-100 flex-col items-center justify-center rounded-3xl border border-dashed text-center">
          <div className="rounded-full bg-muted p-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No Report Loaded</h3>
          <p className="text-sm text-muted-foreground">
            Enter a product number above to see detailed breakdown.
          </p>
        </div>
      )}
    </div>
  )
}
