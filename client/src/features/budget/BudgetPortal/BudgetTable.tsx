import { BudgetCategoryRows } from "./BudgetCategoryRows";
import { SummaryRow } from "./SummaryRow";
import { useBudget } from "./hooks/useBudgetContext";

export function BudgetTable() {
  const { budgetDraft, getBudgetTotals, getCategoryTotals, updateBudgetItem } = useBudget();

  if (!budgetDraft) {
    return null;
  }

  const totals = getBudgetTotals(budgetDraft);

  return (
    <div className="overflow-auto rounded-2xl border border-border/80">
      <table className="w-full min-w-215 text-sm">
        <thead>
          <tr className="sticky top-0 z-10 bg-muted/50 backdrop-blur">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cost Item</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Planned (INR)</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actual (INR)</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Variance</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Var %</th>
          </tr>
        </thead>
        <tbody>
          {budgetDraft.categories.map((category, categoryIndex) => (
            <BudgetCategoryRows
              key={`${budgetDraft.header.budgetId}-${category.categoryId}`}
              category={category}
              categoryIndex={categoryIndex}
              onUpdateItem={updateBudgetItem}
              totals={getCategoryTotals(categoryIndex, budgetDraft)}
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

