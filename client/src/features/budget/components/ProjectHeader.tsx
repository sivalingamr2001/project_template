import { useState } from "react";
import { useBudget } from "@/features/budget/budget-context";
import { formatDate } from "@/features/budget/budget-format";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/shared/components/ui/alert-dialog";
import { FileDown, RefreshCcw, Save } from "lucide-react";
import { toast } from "sonner";

export function ProjectHeader({ onViewReport }: { onViewReport: () => void }) {
  const [isRefreshConfirmOpen, setIsRefreshConfirmOpen] = useState(false);
  const { activeRecord, saveDraft, loadRecord } = useBudget();

  const isFormValid = Boolean(
    activeRecord?.projectHeader.projectCode &&
    activeRecord.projectHeader.productNo,
  );

  function handleExportCsv() {
    if (!activeRecord) {
      return;
    }

    const rows: string[] = [
      "Category,Cost Item,Planned (INR),Actual (INR),Variance (INR),Variance %",
    ];

    activeRecord.budgetData.forEach((category) => {
      category.items.forEach((item) => {
        const variance = item.planned - item.actual;
        const variancePercent =
          item.planned > 0 ? (variance / item.planned) * 100 : 0;
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

  async function handleSaveDraft() {
    try {
      await saveDraft();
      toast.success("Budget draft saved and project status refreshed.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to save the budget draft.");
    }
  }

  function handleRefreshClick() {
    if (activeRecord?.id.startsWith("draft-")) {
      setIsRefreshConfirmOpen(true);
      return;
    }

    toast.success("Budget refreshed.");
  }

  function confirmRefresh() {
    loadRecord(null);
    setIsRefreshConfirmOpen(false);
    toast.success("Draft session cleared. Returning to the project search view.");
  }

  if (!activeRecord) {
    return null;
  }

  const { projectHeader } = activeRecord;

  return (
    <div className="border-b border-border/70 bg-muted/30 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-display text-2xl text-foreground">
            {projectHeader.productName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="text-foreground font-medium">Project:</span>{" "}
            {projectHeader.projectCode} |{" "}
            <span className="text-foreground font-medium">Product No:</span>{" "}
            {projectHeader.productNo}
            {projectHeader.productNo}
          </p>
        </div>
        <div className="flex flex-col items-start gap-4 md:items-end">
          <div className="flex gap-3 mr-3 text-sm text-muted-foreground">
            Modified On
            <div className="font-semibold text-foreground">
              {formatDate(projectHeader.lastUpdated)}
            </div>
          </div>
          <div className="shrink-0 flex flex-col gap-3 px-2 md:flex-row md:items-center md:justify-end">
            <Button size="sm" variant="outline" onClick={handleRefreshClick}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={handleExportCsv} size="sm" variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              disabled={!isFormValid}
              onClick={handleSaveDraft}
              size="sm"
              variant="default"
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </div>
      <AlertDialog open={isRefreshConfirmOpen} onOpenChange={setIsRefreshConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard draft changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Refreshing now will clear your current draft session and return you
              to the project search view. Continue or keep editing?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Button size="sm" variant="outline">
                Keep Editing
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction>
              <Button size="sm" variant="default" onClick={confirmRefresh}>
                Reload Drafts
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
