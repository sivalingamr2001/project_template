import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/shared/components/ui/card";
import { ChartContainer } from "@/shared/components/ui/chart";
import { formatINR } from "@/shared/utils/utils";
import { categoryConfig, sampleBudgetData } from "./constants/analyticsCharts";

export function CategoryComparisonChart() {
  const categoryData = sampleBudgetData;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Planned vs Actual by Category</h3>
          <p className="text-sm text-muted-foreground">All amounts in ₹ Lakhs</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span>Planned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span>Actual</span>
          </div>
        </div>
      </div>
      <ChartContainer config={categoryConfig} className="h-80">
        <BarChart data={categoryData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="category" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => formatINR(value)} width={64} />
          <Tooltip cursor={false} />
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
  );
}
