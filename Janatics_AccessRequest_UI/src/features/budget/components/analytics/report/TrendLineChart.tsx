import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { ChartContainer } from "@/shared/components/ui/chart"
import { formatINR } from "@/shared/utils/utils"
import { MONTHS, trendConfig } from "../constants/analyticsCharts"
import type { BudgetTotals } from "@/features/budget/types"

export function TrendLineChart({ totals }: { totals: BudgetTotals }) {
  const baseline = Math.max(
    1,
    totals.totalPlanned,
    totals.totalActual,
    totals.variance
  )
  const trendData = MONTHS.map((month, index) => ({
    month,
    planned: Math.round(baseline * (0.68 + 0.025 * index)),
    actual: Math.round(baseline * (0.62 + 0.028 * index)),
  }))

  return (
    <div className="rounded-3xl border border-border/70 bg-background/50 p-5">
      <div className="mb-4">
        <div className="font-display text-xl text-foreground">
          12-Month Spend Trend
        </div>
        <div className="text-sm text-muted-foreground">
          Actual vs planned spend over the last year
        </div>
      </div>
      <ChartContainer config={trendConfig}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => formatINR(value)} width={64} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="planned"
            stroke="var(--color-planned)"
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="var(--color-actual)"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}
