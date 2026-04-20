import { formatINR, formatPercent } from "@/shared/utils/utils";
import { sampleTotals } from "../constants/analyticsCharts";
import { SummaryCard } from "./SummaryCard";

export function ReportHeader() {
  const totals = sampleTotals;
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
