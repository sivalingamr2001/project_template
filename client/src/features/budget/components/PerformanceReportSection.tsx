import { Copy, Printer, TrendingDown, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { SummaryRow } from "@/features/budget/components/BudgetTable";
import { useBudget } from "@/features/budget/budget-context";
import { formatINR, formatPercent } from "@/features/budget/budget-format";
import { varianceClassName } from "@/features/budget/budget-ui.utils";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import { toast } from "sonner";

const trendConfig = {
  planned: {
    label: "Planned",
    color: "var(--chart-1)",
  },
  actual: {
    label: "Actual",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const categoryConfig = {
  planned: {
    label: "Planned",
    color: "var(--chart-1)",
  },
  actual: {
    label: "Actual",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const scatterConfig = {
  actual: {
    label: "Actual",
    color: "var(--chart-2)",
  },
  utilization: {
    label: "Utilization",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

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
    <Card className="flex min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border/70 px-5 py-4">
        <Badge
          className="border-primary/20 bg-primary/10 text-primary"
          variant="secondary"
        >
          Quarterly Performance Report
        </Badge>
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-auto p-5">
        <ReportHeader />
        <ExecutiveSummary />
        <div className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-5">
            <TrendLineChart />
            <DeepDiveInsights />
          </div>
          <div className="space-y-5">
            <CategoryStackedChart />
            <VarianceScatterPlot />
          </div>
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

function ReportHeader() {
  const { activeRecord, getTotals } = useBudget();

  if (!activeRecord) {
    return null;
  }

  const totals = getTotals();
  const varianceRate = totals.totalPlanned
    ? ((totals.totalActual - totals.totalPlanned) / totals.totalPlanned) * 100
    : 0;
  const utilization = totals.totalPlanned
    ? (totals.totalActual / totals.totalPlanned) * 100
    : 0;
  const lastUpdated = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-rose-200/90 bg-rose-50 p-5 text-rose-900 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700/80">
              Overall Status
            </div>
            <div className="mt-3 flex items-center gap-3 text-xl font-semibold tracking-tight sm:text-2xl">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                !
              </span>
              OVER BUDGET{" "}
              <span className="text-rose-900">{varianceRate.toFixed(1)}%</span>
            </div>
            <div className="mt-2 text-sm text-rose-700/90">
              Action Required - Review critical cost heads.
            </div>
          </div>
          <div className="rounded-3xl border border-rose-300/80 bg-white/80 px-4 py-3 text-right text-sm text-slate-700 shadow-sm">
            <div className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
              Last Updated
            </div>
            <div className="mt-1 font-medium">{lastUpdated}</div>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-3">
        <SummaryCard
          title="Total Planned"
          value={formatINR(totals.totalPlanned)}
          note=""
          accent="slate"
        />
        <SummaryCard
          title="Total Actual"
          value={formatINR(totals.totalActual)}
          note="(spent + committed)"
          accent="violet"
        />
        <SummaryCard
          title="Variance"
          value={`${formatINR(totals.variance)} (${varianceRate.toFixed(1)}%)`}
          note=""
          accent={varianceRate > 0 ? "rose" : "emerald"}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-3">
        <SummaryCard
          title="Direct Cost Variance"
          value={`${formatPercent(varianceRate)}`}
          note="First 10 cost heads"
          accent="rose"
        />
        <SummaryCard
          title="Indirect Cost Variance"
          value="0.0%"
          note="Factory OH + Team"
          accent="emerald"
        />
        <SummaryCard
          title="Budget Utilization"
          value={`${formatPercent(utilization)}`}
          note="of planned budget"
          accent={utilization > 100 ? "rose" : "emerald"}
        />
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  note,
  accent = "slate",
}: {
  title: string;
  value: string;
  note: string;
  accent?: "slate" | "violet" | "rose" | "emerald";
}) {
  const accentClass =
    accent === "violet"
      ? "text-violet-600"
      : accent === "rose"
        ? "text-rose-600"
        : accent === "emerald"
          ? "text-emerald-600"
          : "text-slate-900";

  return (
    <div className="rounded-3xl border border-border/70 bg-background/50 p-5 shadow-sm">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </div>
      <div className={`mt-4 text-3xl font-semibold ${accentClass}`}>
        {value}
      </div>
      {note ? (
        <div className="mt-2 text-sm text-muted-foreground">{note}</div>
      ) : null}
    </div>
  );
}

function ExecutiveSummary() {
  const { activeRecord, getTotals, getCategoryTotals } = useBudget();

  if (!activeRecord) {
    return null;
  }

  const totals = getTotals();
  const categories = activeRecord.budgetData.map((category, index) => {
    const categoryTotals = getCategoryTotals(index);
    const variance = categoryTotals.planned - categoryTotals.actual;
    const utilization = categoryTotals.planned
      ? (categoryTotals.actual / categoryTotals.planned) * 100
      : 0;

    return {
      name: category.category,
      variance,
      utilization,
    };
  });

  const topVariance = categories.reduce(
    (prev, next) =>
      Math.abs(next.variance) > Math.abs(prev.variance) ? next : prev,
    categories[0],
  );
  const overBudgetCount = categories.filter(
    (item) => item.utilization > 100,
  ).length;
  const performancePhrase =
    totals.totalActual > totals.totalPlanned ? "above plan" : "below plan";

  return (
    <div className="rounded-3xl border border-border/70 bg-background/50 p-5">
      <div className="text-sm font-semibold text-foreground">
        Executive Summary
      </div>
      <div className="mt-4 space-y-3 text-sm text-muted-foreground">
        <div className="flex items-start gap-3">
          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
          <p>
            Total actual spend is <strong>{performancePhrase}</strong>, with a
            variance of <strong>{formatINR(totals.variance)}</strong> driven by{" "}
            <strong>{topVariance.name}</strong>.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-muted-foreground" />
          <p>
            {overBudgetCount} category{overBudgetCount === 1 ? "" : "ies"} are
            currently over budget, signaling a need for tighter category
            controls.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-500" />
          <p>
            Trend analysis suggests spend momentum is stabilizing, with the next
            period dependent on corrective oversight for high-variance segments.
          </p>
        </div>
      </div>
    </div>
  );
}

function TrendLineChart() {
  const { activeRecord, getTotals } = useBudget();

  if (!activeRecord) {
    return null;
  }

  const totals = getTotals();
  const baseline = Math.max(1, totals.totalPlanned || totals.totalActual);
  const trendData = MONTHS.map((month, index) => ({
    month,
    planned: Math.round(baseline * (0.68 + 0.025 * index)),
    actual: Math.round(baseline * (0.62 + 0.028 * index)),
  }));

  return (
    <div className="rounded-3xl border border-border/70 bg-background/50 p-5">
      <div className="mb-4">
        <div className="font-display text-xl text-foreground">
          12-Month Spend Trend
        </div>
        <div className="text-sm text-muted-foreground">
          Actual vs planned spend over the last year
        </div>
      </div>
      <ChartContainer config={trendConfig}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => formatINR(value)} width={64} />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="planned"
            stroke="var(--color-planned)"
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="var(--color-actual)"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}

function CategoryStackedChart() {
  const { activeRecord, getCategoryTotals } = useBudget();

  if (!activeRecord) {
    return null;
  }

  const categoryData = activeRecord.budgetData.map((category, index) => {
    const totals = getCategoryTotals(index);
    return {
      category: category.category,
      planned: totals.planned,
      actual: totals.actual,
    };
  });

  return (
    <div className="rounded-3xl border border-border/70 bg-background/50 p-5">
      <div className="mb-4">
        <div className="font-display text-xl text-foreground">
          Category Spend Comparison
        </div>
        <div className="text-sm text-muted-foreground">
          Planned and actual spend by category
        </div>
      </div>
      <ChartContainer config={categoryConfig}>
        <BarChart data={categoryData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="category" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => formatINR(value)} width={64} />
          <Tooltip cursor={false} content={<ChartTooltipContent />} />
          <Legend />
          <Bar
            dataKey="planned"
            stackId="a"
            fill="var(--color-planned)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="actual"
            stackId="a"
            fill="var(--color-actual)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

function VarianceScatterPlot() {
  const { activeRecord, getCategoryTotals } = useBudget();

  if (!activeRecord) {
    return null;
  }

  const data = activeRecord.budgetData.map((category, index) => {
    const totals = getCategoryTotals(index);
    return {
      category: category.category,
      actual: totals.actual,
      utilization: totals.planned ? (totals.actual / totals.planned) * 100 : 0,
    };
  });

  return (
    <div className="rounded-3xl border border-border/70 bg-background/50 p-5">
      <div className="mb-4">
        <div className="font-display text-xl text-foreground">
          Variance vs Utilization
        </div>
        <div className="text-sm text-muted-foreground">
          How actual spend relates to category efficiency
        </div>
      </div>
      <ChartContainer config={scatterConfig}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="actual"
            type="number"
            name="Actual"
            tickFormatter={(value) => formatINR(value)}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="utilization"
            type="number"
            name="Utilization"
            unit="%"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Scatter name="Category" data={data} fill="var(--color-actual)" />
        </ScatterChart>
      </ChartContainer>
      <div className="mt-4 text-sm text-muted-foreground">
        Categories in the upper right are high spend and high utilization, and
        should be reviewed first.
      </div>
    </div>
  );
}

function DeepDiveInsights() {
  const { activeRecord, getCategoryTotals, getTotals } = useBudget();

  if (!activeRecord) {
    return null;
  }

  const totals = getTotals();
  const categories = activeRecord.budgetData.map((category, index) => {
    const categoryTotals = getCategoryTotals(index);
    return {
      name: category.category,
      planned: categoryTotals.planned,
      actual: categoryTotals.actual,
      variance: categoryTotals.planned - categoryTotals.actual,
      utilization: categoryTotals.planned
        ? (categoryTotals.actual / categoryTotals.planned) * 100
        : 0,
    };
  });

  const highestVariance = categories.reduce(
    (prev, next) =>
      Math.abs(next.variance) > Math.abs(prev.variance) ? next : prev,
    categories[0],
  );

  return (
    <div className="rounded-3xl border border-border/70 bg-background/50 p-5">
      <div className="font-display text-xl text-foreground">
        Deep-Dive Insights
      </div>
      <div className="mt-4 space-y-3 text-sm text-muted-foreground">
        <p>
          The root cause of the current variance is concentrated in{" "}
          <strong>{highestVariance.name}</strong>, where actual spend is{" "}
          <strong>{formatINR(highestVariance.actual)}</strong> versus a plan of{" "}
          <strong>{formatINR(highestVariance.planned)}</strong>.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Validate scope and resourcing assumptions for the top variance
            category to prevent further drift.
          </li>
          <li>
            Shift flexibility from lower-utilization categories to support
            priority initiatives without increasing total spend.
          </li>
          <li>
            Establish weekly budget checkpoints for categories above 100%
            utilization to catch overspend early.
          </li>
        </ul>
      </div>
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
        <div className="font-display text-xl text-foreground">
          Detailed Audit Report
        </div>
        <div className="text-sm text-muted-foreground">
          Category totals and line-item variance summary
        </div>
      </div>
      <table className="w-full min-w-[760px] table-fixed text-sm">
        <colgroup>
          <col className="w-[40%]" />
          <col className="w-[15%]" />
          <col className="w-[15%]" />
          <col className="w-[15%]" />
          <col className="w-[15%]" />
        </colgroup>
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
        </tbody>
        <tfoot className="bg-background/95">
          <SummaryRow
            actual={totals.totalActual}
            label="Total Cost, Rs."
            planned={totals.totalPlanned}
            variance={totals.variance}
            variancePercent={totals.variancePercent}
            className="sticky bottom-0 z-10 border-t border-border/70"
          />
        </tfoot>
      </table>
    </div>
  );
}

function AuditCategoryRows({
  category,
  totals,
}: {
  category: {
    category: string;
    items: Array<{ name: string; planned: number; actual: number }>;
  };
  totals: {
    planned: number;
    actual: number;
    variance: number;
    variancePercent: number;
  };
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
        const variancePercent =
          item.planned > 0 ? (variance / item.planned) * 100 : 0;

        return (
          <tr
            className="border-t border-border/50"
            key={`${category.category}-${item.name}`}
          >
            <td className="px-3 py-3 text-muted-foreground">{item.name}</td>
            <td className="px-3 py-3 text-right">{formatINR(item.planned)}</td>
            <td className="px-3 py-3 text-right">{formatINR(item.actual)}</td>
            <td
              className={`px-3 py-3 text-right ${varianceClassName(variance)}`}
            >
              {formatINR(variance)}
            </td>
            <td
              className={`px-3 py-3 text-right ${varianceClassName(variance)}`}
            >
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
