import React, { useMemo, useState } from "react"
import { format } from "date-fns"
import {
  Calendar as CalendarIcon,
  ChevronDown,
  LayoutDashboard,
  MoreHorizontal,
} from "lucide-react"

// UI Components (Assuming standard Shadcn/Radix structure)
import { BudgetMetricCard } from "@/shared/components/dashboard/BudgetMetricCard"
import { PlannedVsActualBarChart } from "@/shared/components/dashboard/PlannedVsActualBarChart"
import { VarianceTrendChart } from "@/shared/components/dashboard/VarianceTrendChart"
import { Button } from "@/shared/components/ui/button"
import { Calendar } from "@/shared/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"

// Hooks
import {
  useBudgetSummary,
  useMonthlyTrend,
  useQuarterlyTrend,
  useYearlyTrend,
} from "@/shared/hooks/useBudget"

// Utils
function formatCurrency(value: number) {
  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  })
}

type PeriodOption = "monthly" | "quarterly" | "yearly" | "custom"

export default function Dashboard() {
  const [period, setPeriod] = useState<PeriodOption>("yearly")
  const [date, setDate] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  })

  // Data fetching
  const summary = useBudgetSummary(
    period,
    period === "custom" ? format(date.from, "yyyy-MM-dd") : undefined,
    period === "custom" ? format(date.to, "yyyy-MM-dd") : undefined
  )

  const monthlyTrend = useMonthlyTrend()
  const quarterlyTrend = useQuarterlyTrend()
  const yearlyTrend = useYearlyTrend()

  const trendData = useMemo(() => {
    if (period === "yearly") return yearlyTrend
    if (period === "quarterly") return quarterlyTrend
    return monthlyTrend
  }, [period, monthlyTrend, quarterlyTrend, yearlyTrend])

  const variance = summary.summary?.variance ?? 0
  const variancePct = summary.summary?.variancePct ?? 0

  return (
    <div className="space-y-2 bg-background p-0 lg:p-0">
      {/* 🟢 TOP NAV / HEADER */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            Budget Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Analytics for live projects and financial tracking.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end rounded-full border bg-card p-1.5 pl-4 shadow-sm">
          {/* 🏷️ Status Label (Shows currently selected period) */}
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {period === "custom" ? "Custom Range" : `${period} View`}
            </span>
          </div>

          {/* 🗓️ Date Display - Shows when 'custom' is active */}
          {period === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 rounded-full px-3 text-[11px]"
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {format(date.from, "MMM dd")} - {format(date.to, "MMM dd, y")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date.from}
                  selected={{ from: date.from, to: date.to }}
                  onSelect={(range: any) =>
                    range?.from && range?.to && setDate(range)
                  }
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}

          {/* 🔘 The Corner Dot Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-accent"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Switch View</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setPeriod("monthly")}>
                Monthly View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod("quarterly")}>
                Quarterly View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod("yearly")}>
                Yearly View
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setPeriod("custom")}
                className="font-medium text-primary"
              >
                Set Custom Range...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <hr className="opacity-10" />

      {/* 📊 METRICS GRID */}
      <div className="grid gap-6 mb-6 sm:grid-cols-2 xl:grid-cols-4">
        <BudgetMetricCard
          title="Total Planned Budget (₹)"
          value={formatCurrency(summary.summary?.totalPlanned ?? 0)}
          subtitle="Overall plan"
          change="Planned base"
          trend="positive"
        />
        <BudgetMetricCard
          title="Total Actual Spent (₹)"
          value={formatCurrency(summary.summary?.totalActual ?? 0)}
          subtitle="Overall actuals"
          change="ERP actuals"
          trend="neutral"
        />
        <BudgetMetricCard
          title="Overall Variance"
          value={formatCurrency(variance)}
          subtitle={`${variancePct.toFixed(1)}% vs planned`}
          change={variance >= 0 ? "Savings" : "Deficit"}
          trend={variance >= 0 ? "positive" : "negative"}
        />
        <BudgetMetricCard
          title="Active Projects"
          value={String(summary.summary?.activeProjects ?? 0)}
          subtitle="Live execution"
          change="Project count"
          trend="neutral"
        />
      </div>

      {/* 📉 CHARTS SECTION */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border bg-card p-2 shadow-sm transition-all hover:shadow-md">
          <PlannedVsActualBarChart data={trendData} />
        </div>
        <div className="rounded-3xl border bg-card p-2 shadow-sm transition-all hover:shadow-md">
          <VarianceTrendChart
            data={trendData.map((point) => ({
              label: point.label,
              variance: point.variance,
            }))}
          />
        </div>
      </div>
    </div>
  )
}
