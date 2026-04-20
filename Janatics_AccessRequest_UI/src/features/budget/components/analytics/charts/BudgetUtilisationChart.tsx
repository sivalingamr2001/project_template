import { Pie, PieChart, Cell, Tooltip } from "recharts";

import { Card } from "@/shared/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/shared/components/ui/chart";
import { donutConfig, sampleTotals } from "../utils/constants";

export function BudgetUtilisationChart() {
  const totals = sampleTotals;
  const utilization = totals.totalPlanned
    ? (totals.totalActual / totals.totalPlanned) * 100
    : 0;

  // Sample data - in real app, this would come from actual category breakdowns
  const donutData = [
    { name: "Engineering Labour", value: 37.8, fill: "#1a56db" },
    { name: "Material & Components", value: 25.1, fill: "#10b981" },
    { name: "Machining & Fabrication", value: 18.6, fill: "#f59e0b" },
    { name: "Testing & Validation", value: 11.1, fill: "#6366f1" },
    { name: "Miscellaneous", value: 7.4, fill: "#ef4444" },
  ];

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Budget Utilisation Breakdown</h3>
        <p className="text-sm text-muted-foreground">As % of total planned spend</p>
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
          <div className="text-center mb-4">
            <div className="text-3xl font-bold">{utilization.toFixed(0)}%</div>
            <div className="text-sm text-muted-foreground">Used</div>
          </div>
          <div className="space-y-2">
            {donutData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
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
  );
}