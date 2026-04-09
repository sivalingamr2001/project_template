import { TrendingUp } from "lucide-react";

import type { ActiveView } from "@/features/budget/budget-page.types";
import { useBudget } from "@/features/budget/budget-context";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";

export function BudgetTopNavbar({
  activeView,
  onViewChange,
}: {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
}) {
  const { activeRecord } = useBudget();

  return (
    <Card className="overflow-hidden border-primary/15">
      <div className="flex flex-col gap-4 border-b border-border/70 bg-linear-to-r from-card via-card to-secondary/70 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1a4fa3] text-white shadow-lg shadow-blue-950/25">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-semibold text-foreground">Janatics India Pvt. Ltd.</div>
            <div className="text-sm text-muted-foreground">R&D Budget Management Portal</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-2xl border border-border/80 bg-background/70 p-1">
            <TopTabButton
              active={activeView === "project-search"}
              label="Project Search"
              onClick={() => onViewChange("project-search")}
            />
            <TopTabButton
              active={activeView === "plan-entry"}
              disabled={!activeRecord}
              label="Plan Entry"
              onClick={() => onViewChange("plan-entry")}
            />
            <TopTabButton
              active={activeView === "performance-report"}
              disabled={!activeRecord}
              label="Performance Report"
              onClick={() => onViewChange("performance-report")}
            />
          </div>  
        </div>
      </div>
    </Card>
  );
}

function TopTabButton({
  active,
  disabled = false,
  label,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-primary text-primary-foreground shadow-md shadow-blue-950/20"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      } ${disabled ? "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-muted-foreground" : ""}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
