import { BudgetListRow } from "./BudgetListRow";
import type { BudgetRecordSummary } from "./types";

interface Props {
  hasSearched: boolean;
  records: BudgetRecordSummary[];
  onOpenBudget: (budgetId: number) => void;
}

export function BudgetsTable({ hasSearched, onOpenBudget, records }: Props) {
  const hasRows = records.length > 0;

  return (
    <div className="h-full overflow-auto rounded-2xl border border-border/70">
      <table className="w-full min-w-245 text-sm">
        <thead>
          <tr className="sticky top-0 z-10 bg-muted/40 text-muted-foreground backdrop-blur">
            <th className="px-4 py-4 text-left font-medium">PROJECT #</th>
            <th className="px-4 py-4 text-left font-medium">PRODUCT #</th>
            <th className="px-4 py-4 text-left font-medium">TITLE</th>
            <th className="px-4 py-4 text-left font-medium">MODIFIED</th>
            <th className="px-4 py-4 text-center font-medium">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {hasRows ? (
            records.map((record) => <BudgetListRow key={record.budgetId} record={record} onOpen={onOpenBudget} />)
          ) : hasSearched ? (
            <tr>
              <td className="px-4 py-10 text-center text-muted-foreground" colSpan={5}>
                No matching budgets found in the list.
              </td>
            </tr>
          ) : (
            <tr>
              <td className="px-4 py-10 text-center text-muted-foreground" colSpan={5}>
                Search to see matching budgets.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

