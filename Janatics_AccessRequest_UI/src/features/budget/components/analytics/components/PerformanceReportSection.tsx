import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import { ReportHeader } from "./components/ReportHeader";
import { ExecutiveSummary } from "./components/ExecutiveSummary";
import { TrendLineChart } from "./charts/TrendLineChart";
import { DeepDiveInsights } from "./components/DeepDiveInsights";
import { CategoryStackedChart } from "./charts/CategoryStackedChart";
import { VarianceScatterPlot } from "./charts/VarianceScatterPlot";

export function PerformanceReportSection() {
  return (
    <Card className="flex min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border/70 px-5 py-4">
        <Badge
          className="border-primary/20 bg-primary/10 text-primary"
          variant="secondary"
        >
          Quarterly Performance Report
        </Badge>
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-auto p-5">
        <ReportHeader />
        <ExecutiveSummary />
        <div className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-5">
            <TrendLineChart />
            <DeepDiveInsights />
          </div>
          <div className="space-y-5">
            <CategoryStackedChart />
            <VarianceScatterPlot />
          </div>
        </div>
      </div>
    </Card>
  );
}