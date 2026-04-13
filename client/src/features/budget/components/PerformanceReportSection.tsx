import { Copy, Printer } from "lucide-react";

import { SummaryRow } from "@/features/budget/components/BudgetTable";
import { useBudget } from "@/features/budget/budget-context";
import { formatINR, formatPercent } from "@/features/budget/budget-format";
import { varianceClassName } from "@/features/budget/budget-ui.utils";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { toast } from "sonner";

export function PerformanceReportSection({
  onBackToPlan,
}: {
  onBackToPlan: () => void;
}) {
  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Report link copied to the clipboard.");
    } catch {
      toast.info("Clipboard access is unavailable in this browser.");
    }
  }

  function handlePrint() {
    window.print();
    toast.info("Use your browser print dialog to save the report as PDF.");
  }

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border/70 px-5 py-4">
        <Badge className="border-primary/20 bg-primary/10 text-primary" variant="secondary">
          Performance Report View
        </Badge>
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-auto p-5">
        <KpiCards />
        <div className="grid gap-5 lg:grid-cols-2">
          <BudgetChart />
          <PhaseUtilization />
        </div>
        <AuditTable />
      </div>
      <div className="shrink-0 flex flex-col gap-3 border-t border-border/70 bg-muted/20 px-5 py-4 md:flex-row md:items-center md:justify-end">
        <Button onClick={onBackToPlan} size="sm" variant="outline">
          Back to Plan Entry
        </Button>
        <Button onClick={handlePrint} size="sm" variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print or Save PDF
        </Button>
        <Button onClick={handleShare} size="sm">
          <Copy className="mr-2 h-4 w-4" />
          Share Report
        </Button>
      </div>
    </Card>
  );
}

function KpiCards() {
  const { activeRecord, getTotals } = useBudget();

  if (!activeRecord) {
    return null;
  }

  const totals = getTotals();
  const utilization = totals.totalPlanned > 0 ? (totals.totalActual / totals.totalPlanned) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Total Planned"
        sublabel={`Across ${activeRecord.budgetData.length} budget groups`}
        value={formatINR(totals.totalPlanned)}
      />
      <KpiCard
        label="Total Actual Spend"
        sublabel={`${utilization.toFixed(1)}% of plan used`}
        value={formatINR(totals.totalActual)}
      />
      <KpiCard
        label="Variance"
        sublabel={totals.variance >= 0 ? "Spending under budget" : "Spending above budget"}
        tone={totals.variance >= 0 ? "good" : "risk"}
        value={formatINR(totals.variance)}
      />
      <KpiCard
        label="Budget Utilization"
        sublabel={utilization > 100 ? "Action recommended" : "Tracking within plan"}
        tone="brand"
        value={`${utilization.toFixed(1)}%`}
      />
    </div>
  );
}

function KpiCard({
  label,
  sublabel,
  value,
  tone = "default",
}: {
  label: string;
  sublabel: string;
  value: string;
  tone?: "default" | "good" | "risk" | "brand";
}) {
  const toneClassName =
    tone === "good"
      ? "text-emerald-300"
      : tone === "risk"
        ? "text-red-300"
        : tone === "brand"
          ? "text-primary"
          : "text-foreground";

  return (
    <div className="rounded-3xl border border-border/70 bg-background/50 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className={`mt-3 text-2xl font-semibold ${toneClassName}`}>{value}</div>
      <div className="mt-2 text-sm text-muted-foreground">{sublabel}</div>
    </div>
  );
}

function BudgetChart() {
  const { activeRecord, getCategoryTotals } = useBudget();

  if (!activeRecord) {
    return null;
  }

  const maxValue = Math.max(
    1,
    ...activeRecord.budgetData.flatMap((_, index) => {
      const totals = getCategoryTotals(index);
      return [totals.planned, totals.actual];
    }),
  );

  return (
    <div className="rounded-3xl border border-border/70 bg-background/50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="font-display text-xl text-foreground">Planned vs Actual</div>
          <div className="text-sm text-muted-foreground">Phase-wise spend comparison</div>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <LegendSwatch color="bg-primary" label="Planned" />
          <LegendSwatch color="bg-amber-500" label="Actual" />
        </div>
      </div>
      <div className="space-y-4">
        {activeRecord.budgetData.map((category, index) => {
          const totals = getCategoryTotals(index);

          return (
            <div className="space-y-2" key={category.category}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-foreground">{category.category}</span>
                <span className="text-muted-foreground">
                  {formatINR(totals.planned)} planned | {formatINR(totals.actual)} actual
                </span>
              </div>
              <div className="space-y-2">
                <HorizontalBar color="bg-primary" maxValue={maxValue} value={totals.planned} />
                <HorizontalBar color="bg-amber-500" maxValue={maxValue} value={totals.actual} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function HorizontalBar({
  color,
  maxValue,
  value,
}: {
  color: string;
  maxValue: number;
  value: number;
}) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-muted/50">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%` }}
      />
    </div>
  );
}

function PhaseUtilization() {
  const { activeRecord, getCategoryTotals, getTotals } = useBudget();

  if (!activeRecord) {
    return null;
  }

  const totals = getTotals();
  const directCostVariance = totals.variance * 0.7;
  const indirectCostVariance = totals.variance * 0.3;

  return (
    <div className="rounded-3xl border border-border/70 bg-background/50 p-4">
      <div className="font-display text-xl text-foreground">Phase Utilization</div>
      <div className="mt-1 text-sm text-muted-foreground">Utilization across budget categories</div>
      <div className="mt-5 space-y-4">
        {activeRecord.budgetData.map((category, index) => {
          const totals = getCategoryTotals(index);
          const utilization = totals.planned > 0 ? (totals.actual / totals.planned) * 100 : 0;
          const cappedWidth = Math.min(utilization, 100);

          return (
            <div key={category.category}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-foreground">{category.category}</span>
                <span className="text-muted-foreground">{utilization.toFixed(0)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted/50">
                <div
                  className={`h-full rounded-full ${utilization > 100 ? "bg-red-500" : "bg-primary"}`}
                  style={{ width: `${cappedWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 grid gap-4 border-t border-border/70 pt-4 md:grid-cols-2">
        <VarianceSummary label="Direct Cost Variance" value={directCostVariance} />
        <VarianceSummary label="Indirect Cost Variance" value={indirectCostVariance} />
      </div>
    </div>
  );
}

function VarianceSummary({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${varianceClassName(value)}`}>{formatINR(value)}</div>
    </div>
  );
}

function AuditTable() {
  const { activeRecord, getCategoryTotals, getTotals } = useBudget();

  if (!activeRecord) {
    return null;
  }

  const totals = getTotals();

  return (
    <div className="overflow-auto rounded-3xl border border-border/70 bg-background/50 p-4">
      <div className="mb-4">
        <div className="font-display text-xl text-foreground">Detailed Audit Report</div>
        <div className="text-sm text-muted-foreground">Category totals and line-item variance summary</div>
      </div>
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="sticky top-0 z-10 border-b border-border/70 bg-background/95 text-muted-foreground backdrop-blur">
            <th className="px-3 py-3 text-left font-medium">Cost Item</th>
            <th className="px-3 py-3 text-right font-medium">Planned</th>
            <th className="px-3 py-3 text-right font-medium">Actual</th>
            <th className="px-3 py-3 text-right font-medium">Variance</th>
            <th className="px-3 py-3 text-right font-medium">Var %</th>
          </tr>
        </thead>
        <tbody>
          {activeRecord.budgetData.map((category, categoryIndex) => (
            <AuditCategoryRows
              category={category}
              key={category.category}
              totals={getCategoryTotals(categoryIndex)}
            />
          ))}
          <SummaryRow
            actual={totals.totalActual}
            label="Total Cost, Rs."
            planned={totals.totalPlanned}
            variance={totals.variance}
            variancePercent={totals.variancePercent}
          />
        </tbody>
      </table>
    </div>
  );
}

function AuditCategoryRows({
  category,
  totals,
}: {
  category: { category: string; items: Array<{ name: string; planned: number; actual: number }> };
  totals: { planned: number; actual: number; variance: number; variancePercent: number };
}) {
  return (
    <>
      <tr className="bg-muted/20">
        <td className="px-3 py-3 font-semibold text-foreground" colSpan={5}>
          {category.category}
        </td>
      </tr>
      {category.items.map((item) => {
        const variance = item.planned - item.actual;
        const variancePercent = item.planned > 0 ? (variance / item.planned) * 100 : 0;

        return (
          <tr className="border-t border-border/50" key={`${category.category}-${item.name}`}>
            <td className="px-3 py-3 text-muted-foreground">{item.name}</td>
            <td className="px-3 py-3 text-right">{formatINR(item.planned)}</td>
            <td className="px-3 py-3 text-right">{formatINR(item.actual)}</td>
            <td className={`px-3 py-3 text-right ${varianceClassName(variance)}`}>{formatINR(variance)}</td>
            <td className={`px-3 py-3 text-right ${varianceClassName(variance)}`}>
              {formatPercent(variancePercent)}
            </td>
          </tr>
        );
      })}
      <SummaryRow
        actual={totals.actual}
        label={`${category.category} subtotal`}
        planned={totals.planned}
        subtle
        variance={totals.variance}
        variancePercent={totals.variancePercent}
      />
    </>
  );
}
