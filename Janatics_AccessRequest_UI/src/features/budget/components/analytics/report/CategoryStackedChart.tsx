import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { ChartContainer } from "@/shared/components/ui/chart"
import { formatINR } from "@/shared/utils/utils"
import { categoryConfig, sampleBudgetData } from "../constants/analyticsCharts"

export function CategoryStackedChart() {
  const categoryData = sampleBudgetData

  return (
    <div className="rounded-3xl border border-border/70 bg-background/50 p-5">
      <div className="mb-4">
        <div className="font-display text-xl text-foreground">
          Category Spend Comparison
        </div>
        <div className="text-sm text-muted-foreground">
          Planned and actual spend by category
        </div>
      </div>
      <ChartContainer config={categoryConfig}>
        <BarChart data={categoryData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="category" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => formatINR(value)} width={64} />
          <Tooltip cursor={false} />
          <Legend />
          <Bar
            dataKey="planned"
            stackId="a"
            fill="var(--color-planned)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="actual"
            stackId="a"
            fill="var(--color-actual)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
