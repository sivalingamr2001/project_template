import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { useBudget } from "@/features/budget/budget-context";
import type { ActiveView, PlanTab } from "@/features/budget/budget-page.types";
import { PerformanceReportSection } from "@/features/budget/components/PerformanceReportSection";
import { PlanEntrySection } from "@/features/budget/components/PlanEntrySection";
import { ProjectSearchPage } from "@/features/budget/components/ProjectSearchPage";
import { Button } from "../../shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../shared/components/ui/tabs";

export default function BudgetPage() {
  return <BudgetWorkspace />;
}

function BudgetWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeView = useMemo<ActiveView>(() => {
    const pathname = location.pathname;

    if (pathname.endsWith("/plan-entry")) {
      return "plan-entry";
    }

    if (pathname.endsWith("/performance-report")) {
      return "performance-report";
    }

    return "project-search";
  }, [location.pathname]);

  const [planTab, setPlanTab] = useState<PlanTab>("budget-table");
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [isDraftRefreshConfirmOpen, setIsDraftRefreshConfirmOpen] = useState(false);
  const { activeRecord, state, discardDraft, getRecordTotals, loadRecord } = useBudget();

  const draftRecords = useMemo(
    () => state.records.filter((record) => record.id.startsWith("draft-")),
    [state.records],
  );

  const isActiveDraft = Boolean(activeRecord?.id.startsWith("draft-"));

  useEffect(() => {
    if (!activeRecord && activeView !== "project-search") {
      void navigate({ to: "/budget/search" });
    }
  }, [activeRecord, activeView, navigate]);

  const handleViewChange = (value: string) => {
    const route =
      value === "plan-entry"
        ? "/budget/plan-entry"
        : value === "performance-report"
        ? "/budget/performance-report"
        : "/budget/search";

    void navigate({ to: route });
  };

  return (
    <div className="flex flex-col">
      <Tabs
        value={activeView}
        onValueChange={(value) => handleViewChange(value)}
        className="flex flex-1 flex-col"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <TabsList>
            <TabsTrigger value="project-search">Search</TabsTrigger>
            <TabsTrigger value="plan-entry" disabled={!activeRecord}>
              Plan Entry
            </TabsTrigger>
            <TabsTrigger value="performance-report" disabled={!activeRecord}>
              Performance
            </TabsTrigger>
          </TabsList>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsDraftModalOpen(true)}
          >
            Draft Budgets
          </Button>
        </div>

        <div>
          <TabsContent value="project-search" className="m-0  outline-none">
            <ProjectSearchPage
              onOpenPlanEntry={() => void navigate({ to: "/budget/plan-entry" })}
            />
          </TabsContent>

          <TabsContent value="plan-entry" className="m-0  outline-none">
            {activeRecord && (
              <PlanEntrySection
                onViewReport={() => void navigate({ to: "/budget/performance-report" })}
              />
            )}
          </TabsContent>

          <TabsContent value="performance-report" className="m-0  outline-none">
            {activeRecord && (
              <PerformanceReportSection />
            )}
          </TabsContent>
        </div>
      </Tabs>

      <Dialog open={isDraftModalOpen} onOpenChange={setIsDraftModalOpen}>
        <DialogContent className="max-w-3xl rounded-[2rem] p-6">
          <DialogHeader>
            <DialogTitle>Draft Projects</DialogTitle>
            <DialogDescription>
              Open a saved draft or refresh the draft session before continuing.
            </DialogDescription>
          </DialogHeader>

          {draftRecords.length === 0 ? (
            <div className="rounded-3xl border border-border/80 bg-background/70 p-6 text-center text-sm text-muted-foreground">
              No draft budget projects are available yet. Create a draft from the
              search page to see it here.
            </div>
          ) : (
            <div className="grid gap-4">
              {draftRecords.map((record) => (
                <div
                  key={record.id}
                  className="rounded-3xl border border-border/70 bg-muted p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-semibold text-foreground">
                        {record.projectHeader.projectCode}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {record.projectHeader.productName}
                      </div>
                      {(() => {
                        const totals = getRecordTotals(record);

                        return (
                          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                            <div>
                              Planned:{" "}
                              <span className="font-semibold text-foreground">
                                {totals.totalPlanned.toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div>
                              Actual:{" "}
                              <span className="font-semibold text-foreground">
                                {totals.totalActual.toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div>
                              Updated:{" "}
                              <span className="font-semibold text-foreground">
                                {new Date(record.projectHeader.lastUpdated).toLocaleDateString(
                                  "en-IN",
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          loadRecord(record.id);
                          setIsDraftModalOpen(false);
                          void navigate({ to: "/budget/plan-entry" });
                        }}
                      >
                        Open Draft
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => discardDraft(record.id)}
                      >
                        Discard
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <DialogFooter className="mt-6 gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsDraftModalOpen(false)}
            >
              Close
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                if (isActiveDraft) {
                  setIsDraftRefreshConfirmOpen(true);
                  return;
                }

                loadRecord(null);
                setIsDraftModalOpen(false);
              }}
            >
              Refresh Draft Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDraftRefreshConfirmOpen} onOpenChange={setIsDraftRefreshConfirmOpen}>
        <DialogContent className="max-w-md rounded-[2rem] p-6">
          <DialogHeader>
            <DialogTitle>Confirm Refresh</DialogTitle>
            <DialogDescription>
              Your current draft will be cleared if you refresh. Continue or keep editing?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsDraftRefreshConfirmOpen(false)}
            >
              Keep Editing
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                discardDraft();
                loadRecord(null);
                setIsDraftRefreshConfirmOpen(false);
                setIsDraftModalOpen(false);
              }}
            >
              Reload Drafts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
