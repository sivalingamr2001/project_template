import { FileDown, Save } from "lucide-react";

import type { PlanTab } from "@/features/budget/budget-page.types";
import { BudgetTable } from "@/features/budget/components/BudgetTable";
import { useBudget } from "@/features/budget/budget-context";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { toast } from "@/shared/components/ui/sonner";

export function PlanEntrySection({
  activeTab,
  onTabChange,
  onViewReport,
}: {
  activeTab: PlanTab;
  onTabChange: (tab: PlanTab) => void;
  onViewReport: () => void;
}) {
  const { activeRecord, saveDraft } = useBudget();
  const isFormValid = Boolean(
    activeRecord?.projectHeader.projectCode && activeRecord.projectHeader.productNo,
  );

  function handleExportCsv() {
    if (!activeRecord) {
      return;
    }

    const rows: string[] = ["Category,Cost Item,Planned (INR),Actual (INR),Variance (INR),Variance %"];

    activeRecord.budgetData.forEach((category) => {
      category.items.forEach((item) => {
        const variance = item.planned - item.actual;
        const variancePercent = item.planned > 0 ? (variance / item.planned) * 100 : 0;
        rows.push(
          [
            category.category,
            item.name,
            item.planned,
            item.actual,
            variance,
            variancePercent.toFixed(1),
          ]
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(","),
        );
      });
    });

    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${activeRecord.projectHeader.projectCode.toLowerCase()}-budget.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Budget CSV exported for spreadsheet review.");
  }

  function handleSaveDraft() {
    saveDraft();
    toast.success("Budget draft saved and project status refreshed.");
  }

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-auto">
      <div className="shrink-0 border-b border-border/70 px-5 py-3">
        <div className="flex flex-wrap gap-2">
          <SubTabButton
            active={activeTab === "budget-table"}
            label="Budget Table"
            onClick={() => onTabChange("budget-table")}
          />
          <SubTabButton
            active={activeTab === "phase-timeline"}
            label="Phase Timeline"
            onClick={() => onTabChange("phase-timeline")}
          />
          <SubTabButton
            active={activeTab === "documents"}
            label="Documents"
            onClick={() => onTabChange("documents")}
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-5">
        {activeTab === "budget-table" ? <BudgetTable /> : null}
        {activeTab === "phase-timeline" ? (
          <PlaceholderPanel
            description="Timeline details can be added here once milestone dates are ready."
            title="Phase timeline"
          />
        ) : null}
        {activeTab === "documents" ? (
          <PlaceholderPanel
            description="Link approvals, vendor quotes, and costing worksheets in this section."
            title="Documents"
          />
        ) : null}
      </div>
      {activeTab === "budget-table" ? (
        <div className="shrink-0 flex flex-col gap-3 border-t border-border/70 bg-muted/20 px-5 py-4 md:flex-row md:items-center md:justify-end">
          <Button onClick={handleExportCsv} size="sm" variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button disabled={!isFormValid} onClick={handleSaveDraft} size="sm" variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button onClick={onViewReport} size="sm">
            View Performance Report
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

function SubTabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-xl px-3 py-2 text-sm transition ${
        active
          ? "bg-primary/12 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function PlaceholderPanel({ description, title }: { description: string; title: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border/80 bg-background/40 p-10 text-center">
      <div className="font-display text-xl text-foreground">{title}</div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
