import type { PlanTab } from "@/features/budget/budget-page.types";
import { BudgetTable } from "@/features/budget/components/BudgetTable";
import { ProjectHeader } from "./ProjectHeader";

export function PlanEntrySection({
  onViewReport,
}: {
  onViewReport: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="h-full flex-1 overflow-auto py-5">
        <div>
          <ProjectHeader onViewReport={onViewReport} />
        </div>
        <BudgetTable />
      </div>
    </div>
  );
}
