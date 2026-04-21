import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"

import { Card } from "@/shared/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/shared/components/ui/chart"
import { formatINR } from "@/shared/utils/utils"
import { categoryConfig, sampleBudgetData } from "../utils/constants"

interface CategoryChartData {
  category: string
  planned: number
  actual: number
}

export function CategoryComparisonChart({
  categories,
}: {
  categories?: CategoryChartData[]
}) {
  const categoryData = categories ?? sampleBudgetData

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Planned vs Actual by Category
          </h3>
          <p className="text-sm text-muted-foreground">
            All amounts in ₹ Lakhs
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-600"></div>
            <span>Planned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-600"></div>
            <span>Actual</span>
          </div>
        </div>
      </div>
      <ChartContainer config={categoryConfig} className="h-80">
        <BarChart data={categoryData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="category" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => formatINR(value)} width={64} />
          <Tooltip cursor={false} content={<ChartTooltipContent />} />
          <Legend />
          <Bar
            dataKey="planned"
            fill="var(--color-planned)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="actual"
            fill="var(--color-actual)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </Card>
  )
}
