import { Card } from "@/shared/components/ui/card";

import { BudgetTable } from "./BudgetTable";
import { PlaceholderPanel } from "./PlaceholderPanel";
import { PlanActions } from "./PlanActions";
import { PlanTabs } from "./PlanTabs";
import { useBudget } from "./hooks/useBudgetContext";

export function PlanEntryView() {
  const { planTab, setActiveView, setPlanTab } = useBudget();

  function handleViewReport() {
    setActiveView("performance-report");
  }

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-auto">
      <div className="shrink-0 border-b border-border/70 px-5 py-3">
        <PlanTabs activeTab={planTab} onTabChange={setPlanTab} />
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-5">
        {planTab === "budget-table" ? <BudgetTable /> : null}
        {planTab === "phase-timeline" ? (
          <PlaceholderPanel
            description="Timeline details can be added here once milestone dates are ready."
            title="Phase timeline"
          />
        ) : null}
        {planTab === "documents" ? (
          <PlaceholderPanel
            description="Link approvals, vendor quotes, and costing worksheets in this section."
            title="Documents"
          />
        ) : null}
      </div>
      {planTab === "budget-table" ? <PlanActions onViewReport={handleViewReport} /> : null}
    </Card>
  );
}

