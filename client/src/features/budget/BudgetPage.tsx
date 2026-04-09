import { useEffect, useState } from "react";

import type { ActiveView, PlanTab } from "@/features/budget/budget-page.types";
import { BudgetTopNavbar } from "@/features/budget/components/BudgetTopNavbar";
import { PerformanceReportSection } from "@/features/budget/components/PerformanceReportSection";
import { PlanEntrySection } from "@/features/budget/components/PlanEntrySection";
import { ProjectHeader } from "@/features/budget/components/ProjectHeader";
import { ProjectSearchPage } from "@/features/budget/components/ProjectSearchPage";
import { BudgetProvider, useBudget } from "@/features/budget/budget-context";

export default function BudgetPage() {
  return (
    <BudgetProvider>
      <BudgetWorkspace />
    </BudgetProvider>
  );
}

function BudgetWorkspace() {
  const [activeView, setActiveView] = useState<ActiveView>("project-search");
  const [planTab, setPlanTab] = useState<PlanTab>("budget-table");
  const { activeRecord } = useBudget();

  useEffect(() => {
    if (!activeRecord && activeView !== "project-search") {
      setActiveView("project-search");
    }
  }, [activeRecord, activeView]);

  return (
    <div className="flex h-[calc(100vh-12.5rem)] min-h-152 flex-col overflow-hidden">
      <div className="shrink-0 space-y-5">
        {activeView !== "project-search" && activeRecord ? <ProjectHeader /> : null}
      </div>
      <div className="mt-5 min-h-0 flex-1">
        {activeView === "project-search" ? (
          <ProjectSearchPage onOpenPlanEntry={() => setActiveView("plan-entry")} />
        ) : null}
        {activeView === "plan-entry" && activeRecord ? (
          <PlanEntrySection
            activeTab={planTab}
            onTabChange={setPlanTab}
            onViewReport={() => setActiveView("performance-report")}
          />
        ) : null}
        {activeView === "performance-report" && activeRecord ? (
          <PerformanceReportSection onBackToPlan={() => setActiveView("plan-entry")} />
        ) : null}
      </div>
    </div>
  );
}
