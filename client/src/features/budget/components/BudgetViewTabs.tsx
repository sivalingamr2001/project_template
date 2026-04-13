import { TrendingUp } from "lucide-react";

import type { ActiveView } from "@/features/budget/budget-page.types";
import { useBudget } from "@/features/budget/budget-context";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

const tooltipMessage =
  "Please select a project from search results to access this view";

export function BudgetViewTabs({
  activeView,
  onViewChange,
}: {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
}) {
  const { activeRecord } = useBudget();

  function renderButton(label: string, view: ActiveView) {
    const restricted = !activeRecord && view !== "project-search";

    const button = (
      <button
        type="button"
        className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
          activeView === view
            ? "bg-primary text-primary-foreground shadow-md shadow-blue-950/20"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        } ${restricted ? "cursor-help opacity-80" : "cursor-pointer"}`}
        onClick={() => {
          if (!restricted) {
            onViewChange(view);
          }
        }}
      >
        {label}
      </button>
    );

    if (!restricted) {
      return button;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="bottom">{tooltipMessage}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex rounded-2xl border border-border/80 bg-background/70 p-1">
        {renderButton("Project Search", "project-search")}
        {renderButton("Plan Entry", "plan-entry")}
        {renderButton("Performance Report", "performance-report")}
      </div>
    </div>
  );
}
