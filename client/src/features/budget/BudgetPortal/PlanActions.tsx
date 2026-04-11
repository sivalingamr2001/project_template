import { FileDown, Save } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { toast } from "@/shared/components/ui/sonner";

import { useBudget } from "./hooks/useBudgetContext";

interface Props {
  onViewReport: () => void;
}

export function PlanActions({ onViewReport }: Props) {
  const { budgetDraft, saveBudgetDraft } = useBudget();

  const isFormValid = Boolean(budgetDraft?.header.projectCode && budgetDraft?.header.productNo);

  async function handleSave() {
    await saveBudgetDraft();
  }

  function handleExportCsv() {
    if (!budgetDraft) {
      return;
    }

    const rows: string[] = ["Category,Cost Item,Planned (INR),Actual (INR),Variance (INR),Variance %"];

    budgetDraft.categories.forEach((category) => {
      category.items.forEach((item) => {
        const variance = item.planned - item.actual;
        const variancePercent = item.planned > 0 ? (variance / item.planned) * 100 : 0;
        rows.push([category.categoryName, item.itemName, item.planned, item.actual, variance, variancePercent.toFixed(1)].map(csv).join(","));
      });
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${budgetDraft.header.projectCode.toLowerCase()}-budget.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Budget CSV exported.");
  }

  return (
    <div className="shrink-0 flex flex-col gap-3 border-t border-border/70 bg-muted/20 px-5 py-4 md:flex-row md:items-center md:justify-end">
      <Button onClick={handleExportCsv} size="sm" variant="outline">
        <FileDown className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
      <Button disabled={!isFormValid} onClick={handleSave} size="sm" variant="outline">
        <Save className="mr-2 h-4 w-4" />
        Save
      </Button>
      <Button onClick={onViewReport} size="sm">
        View Performance Report
      </Button>
    </div>
  );
}

function csv(value: unknown) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

