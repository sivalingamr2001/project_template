import { Copy, Printer } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { toast } from "@/shared/components/ui/sonner";

import { useBudget } from "./hooks/useBudgetContext";
import { formatINR } from "./utils/format";

export function PerformanceReportView() {
  const { budgetDraft, getBudgetTotals, setActiveView } = useBudget();

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Report link copied.");
    } catch {
      toast.info("Clipboard access is unavailable in this browser.");
    }
  }

  function handlePrint() {
    window.print();
    toast.info("Use the print dialog to save as PDF.");
  }

  function handleBack() {
    setActiveView("plan-entry");
  }

  if (!budgetDraft) {
    return null;
  }

  const totals = getBudgetTotals(budgetDraft);
  const utilization = totals.totalPlanned > 0 ? (totals.totalActual / totals.totalPlanned) * 100 : 0;

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border/70 px-5 py-4">
        <Badge className="border-primary/20 bg-primary/10 text-primary" variant="secondary">
          Performance Report
        </Badge>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-auto p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Total Planned" sublabel="Approved plan" value={formatINR(totals.totalPlanned)} />
          <KpiCard label="Total Actual" sublabel={`${utilization.toFixed(1)}% utilized`} value={formatINR(totals.totalActual)} />
          <KpiCard
            label="Variance"
            sublabel={totals.variance >= 0 ? "Under budget" : "Over budget"}
            value={formatINR(totals.variance)}
          />
          <KpiCard label="Utilization" sublabel="Actual / Planned" value={`${utilization.toFixed(1)}%`} />
        </div>
      </div>
      <div className="shrink-0 flex flex-col gap-3 border-t border-border/70 bg-muted/20 px-5 py-4 md:flex-row md:items-center md:justify-end">
        <Button onClick={handleBack} size="sm" variant="outline">
          Back to Plan Entry
        </Button>
        <Button onClick={handlePrint} size="sm" variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print / PDF
        </Button>
        <Button onClick={handleShare} size="sm">
          <Copy className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
    </Card>
  );
}

function KpiCard({ label, sublabel, value }: { label: string; sublabel: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-background/60 p-5">
      <div className="text-sm font-semibold text-foreground">{label}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sublabel}</div>
      <div className="mt-3 font-display text-2xl text-foreground">{value}</div>
    </div>
  );
}

