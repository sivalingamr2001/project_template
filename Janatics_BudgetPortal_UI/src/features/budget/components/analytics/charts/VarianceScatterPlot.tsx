import {
  Scatter,
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

import {
  ChartContainer,
  ChartTooltipContent,
} from "@/shared/components/ui/chart"
import { formatINR } from "@/shared/utils/utils"
import { scatterConfig, sampleBudgetData } from "../utils/constants"

interface VarianceScatterCategory {
  category: string
  planned: number
  actual: number
  utilization: number
}

export function VarianceScatterPlot({
  categories,
}: {
  categories?: VarianceScatterCategory[]
}) {
  const chartCategories =
    categories ??
    sampleBudgetData.map((category) => ({
      category: category.category,
      planned: category.planned,
      actual: category.actual,
      utilization: category.planned
        ? (category.actual / category.planned) * 100
        : 0,
    }))
  const data = chartCategories.map((category) => ({
    category: category.category,
    actual: category.actual,
    utilization: category.utilization,
  }))

  return (
    <div className="rounded-3xl border border-border/70 bg-background/50 p-5">
      <div className="mb-4">
        <div className="font-display text-xl text-foreground">
          Variance vs Utilization
        </div>
        <div className="text-sm text-muted-foreground">
          How actual spend relates to category efficiency
        </div>
      </div>
      <ChartContainer config={scatterConfig}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="actual"
            type="number"
            name="Actual"
            tickFormatter={(value) => formatINR(value)}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="utilization"
            type="number"
            name="Utilization"
            unit="%"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Scatter name="Category" data={data} fill="var(--color-actual)" />
        </ScatterChart>
      </ChartContainer>
      <div className="mt-4 text-sm text-muted-foreground">
        Categories in the upper right are high spend and high utilization, and
        should be reviewed first.
      </div>
    </div>
  )
}
