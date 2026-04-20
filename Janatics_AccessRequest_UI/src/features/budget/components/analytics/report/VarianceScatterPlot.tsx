import {
  CartesianGrid,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartContainer } from "@/shared/components/ui/chart";
import { formatINR } from "@/shared/utils/utils";
import { scatterConfig, sampleBudgetData } from "../constants/analyticsCharts";

export function VarianceScatterPlot() {
  const data = sampleBudgetData.map((category) => ({
    category: category.category,
    actual: category.actual,
    utilization: category.planned
      ? (category.actual / category.planned) * 100
      : 0,
  }));

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
          <Tooltip />
          <Scatter name="Category" data={data} fill="var(--color-actual)" />
        </ScatterChart>
      </ChartContainer>
      <div className="mt-4 text-sm text-muted-foreground">
        Categories in the upper right are high spend and high utilization, and
        should be reviewed first.
      </div>
    </div>
  );
}
