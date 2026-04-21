import { Pie, PieChart, Cell, Tooltip } from "recharts"

import type { BudgetTotals } from "@/features/budget/types"
import { Card } from "@/shared/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/shared/components/ui/chart"
import { donutConfig, sampleBudgetData } from "../utils/constants"

interface BudgetUtilisationCategory {
  category: string
  planned: number
  actual: number
  utilization: number
}

const CHART_COLORS = [
  "#1a56db",
  "#10b981",
  "#f59e0b",
  "#6366f1",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
]

export function BudgetUtilisationChart({
  totals,
  categories,
}: {
  totals: BudgetTotals
  categories?: BudgetUtilisationCategory[]
}) {
  const chartCategories = categories ?? sampleBudgetData
  const utilization = totals.totalPlanned
    ? (totals.totalActual / totals.totalPlanned) * 100
    : 0

  const totalActual =
    totals.totalActual ||
    chartCategories.reduce((sum, item) => sum + item.actual, 0)
  const donutData = chartCategories.map((item, index) => ({
    name: item.category,
    value: totalActual ? (item.actual / totalActual) * 100 : 0,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }))

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Budget Utilisation Breakdown</h3>
        <p className="text-sm text-muted-foreground">
          As % of total planned spend
        </p>
      </div>
      <div className="flex items-center gap-8">
        <ChartContainer config={donutConfig} className="h-48 w-48">
          <PieChart>
            <Pie
              data={donutData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              dataKey="value"
            >
              {donutData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
        <div className="flex-1">
          <div className="mb-4 text-center">
            <div className="text-3xl font-bold">{utilization.toFixed(0)}%</div>
            <div className="text-sm text-muted-foreground">Used</div>
          </div>
          <div className="space-y-2">
            {donutData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  ></div>
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
