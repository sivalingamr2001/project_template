import { useEffect, useState } from "react";
import { useSearch } from "@tanstack/react-router";

import type { ActiveView, PlanTab } from "@/features/budget/budget-page.types";
import { PerformanceReportSection } from "@/features/budget/components/PerformanceReportSection";
import { PlanEntrySection } from "@/features/budget/components/PlanEntrySection";
import { ProjectHeader } from "@/features/budget/components/ProjectHeader";
import { ProjectSearchPage } from "@/features/budget/components/ProjectSearchPage";
import { BudgetProvider, useBudget } from "@/features/budget/budget-context";
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
    <div className="flex h-[calc(100vh-12.5rem)] min-h-152 flex-col overflow-hidden">
      <Tabs
        value={activeView}
        onValueChange={(value) => setActiveView(value as ActiveView)}
        className="flex flex-1 flex-col"
      >
        <div className="shrink-0 space-y-5">
          <TabsList>
            <TabsTrigger value="project-search">Search</TabsTrigger>
            <TabsTrigger value="plan-entry" disabled={!activeRecord}>
              Plan Entry
            </TabsTrigger>
            <TabsTrigger value="performance-report" disabled={!activeRecord}>
              Performance
            </TabsTrigger>
          </TabsList>
          {activeView !== "project-search" && activeRecord && <ProjectHeader />}
        </div>

        <div>
          <TabsContent
            value="project-search"
            className="m-0 h-full outline-none"
          >
            <ProjectSearchPage
              onOpenPlanEntry={() => setActiveView("plan-entry")}
            />
          </TabsContent>

          <TabsContent value="plan-entry" className="m-0 h-full outline-none">
            {activeRecord && (
              <PlanEntrySection
                activeTab={planTab}
                onTabChange={setPlanTab}
                onViewReport={() => setActiveView("performance-report")}
              />
            )}
          </TabsContent>

          <TabsContent
            value="performance-report"
            className="m-0 h-full outline-none"
          >
            {activeRecord && (
              <PerformanceReportSection
                onBackToPlan={() => setActiveView("plan-entry")}
              />
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
