import type { BudgetRecord } from "../../types";
import { CategoryComparisonChart } from "./CategoryComparisonChart";
import { BudgetUtilisationChart } from "./BudgetUtilisationChart";
import { VarianceHighlights } from "./VarianceHighlights";
import { PhaseProgress } from "./PhaseProgress";
import { PerformanceReportSection } from "./report/PerformanceReportSection";

export function BudgetAnalyticsSection({ record }: { record: BudgetRecord }) {
  // TODO: Use record data to populate charts instead of hardcoded data
  console.log('Analytics for record:', record.id);
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {/* Category Comparison Bar Chart */}
      <CategoryComparisonChart />

      {/* Budget Utilisation Donut Chart */}
      <BudgetUtilisationChart />

      {/* Variance Highlights */}
      <VarianceHighlights />

      {/* Phase Progress */}
      <PhaseProgress />

      {/* Performance Report Section (existing) */}
      <div className="xl:col-span-2">
        <PerformanceReportSection />
      </div>
    </div>
  );
}