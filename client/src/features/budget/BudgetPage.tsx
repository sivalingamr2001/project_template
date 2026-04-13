import { useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { BudgetProvider, useBudget } from "@/features/budget/budget-context";
import type { ActiveView, PlanTab } from "@/features/budget/budget-page.types";
import { PerformanceReportSection } from "@/features/budget/components/PerformanceReportSection";
import { PlanEntrySection } from "@/features/budget/components/PlanEntrySection";
import { ProjectSearchPage } from "@/features/budget/components/ProjectSearchPage";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../shared/components/ui/tabs";

export default function BudgetPage() {
  return (
    <BudgetProvider>
      <BudgetWorkspace />
    </BudgetProvider>
  );
}

function BudgetWorkspace() {
  const search = useSearch({ strict: false });

  const [activeView, setActiveView] = useState<ActiveView>(() => {
    const view = search.view;
    return view === "plan-entry" ||
      view === "performance-report" ||
      view === "project-search"
      ? (view as ActiveView)
      : "project-search";
  });

  const [planTab, setPlanTab] = useState<PlanTab>("budget-table");
  const { activeRecord } = useBudget();

  // Handle URL sync
  useEffect(() => {
    const view = search.view;
    if (
      view === "project-search" ||
      view === "plan-entry" ||
      view === "performance-report"
    ) {
      setActiveView(view as ActiveView);
    }
  }, [search.view]);

  // Handle Redirect if no record is selected
  useEffect(() => {
    if (!activeRecord && activeView !== "project-search") {
      setActiveView("project-search");
    }
  }, [activeRecord, activeView]);

  return (
    <div className="flex flex-col">
      <Tabs
        value={activeView}
        onValueChange={(value) => setActiveView(value as ActiveView)}
        className="flex flex-1 flex-col"
      >
        <div className="">
          <TabsList>
            <TabsTrigger value="project-search">Search</TabsTrigger>
            <TabsTrigger value="plan-entry" disabled={!activeRecord}>
              Plan Entry
            </TabsTrigger>
            <TabsTrigger value="performance-report" disabled={!activeRecord}>
              Performance
            </TabsTrigger>
          </TabsList>
        </div>

        <div>
          <TabsContent value="project-search" className="m-0  outline-none">
            <ProjectSearchPage
              onOpenPlanEntry={() => setActiveView("plan-entry")}
            />
          </TabsContent>

          <TabsContent value="plan-entry" className="m-0  outline-none">
            {activeRecord && (
              <PlanEntrySection
                onViewReport={() => setActiveView("performance-report")}
              />
            )}
          </TabsContent>

          <TabsContent value="performance-report" className="m-0  outline-none">
            {activeRecord && <PerformanceReportSection />}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
