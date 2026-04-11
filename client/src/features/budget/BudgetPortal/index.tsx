import { useEffect } from "react";

import { useBudget } from "./hooks/useBudgetContext";
import { PlanEntryView } from "./PlanEntryView";
import { PerformanceReportView } from "./PerformanceReportView";
import { ProjectHeaderCard } from "./ProjectHeaderCard";
import { ProjectSearchView } from "./ProjectSearchView";

export default function BudgetPage() {
  const { activeBudget, activeView, setActiveView } = useBudget();

  useEffect(() => {
    if (!activeBudget && activeView !== "project-search") {
      setActiveView("project-search");
    }
  }, [activeBudget, activeView, setActiveView]);

  return (
    <div className="flex h-[calc(100vh-12.5rem)] min-h-152 flex-col overflow-hidden">
      {activeView !== "project-search" && activeBudget ? <ProjectHeaderCard /> : null}
      <div className="mt-5 min-h-0 flex-1">
        {activeView === "project-search" ? <ProjectSearchView /> : null}
        {activeView === "plan-entry" && activeBudget ? <PlanEntryView /> : null}
        {activeView === "performance-report" && activeBudget ? <PerformanceReportView /> : null}
      </div>
    </div>
  );
}
