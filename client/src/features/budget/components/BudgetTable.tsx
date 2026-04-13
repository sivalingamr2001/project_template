import { useEffect, useState } from "react";

import { useBudget } from "@/features/budget/budget-context";
import { formatINR, formatPercent } from "@/features/budget/budget-format";
import { sanitizeAmountInput, varianceClassName } from "@/features/budget/budget-ui.utils";

export function BudgetTable() {
  const { activeRecord, getCategoryTotals, getTotals, updateBudgetItem } = useBudget();

  if (!activeRecord) {
    return null;
  }

  const totals = getTotals();

  return (
    <div className="space-y-3">
      <div className="overflow-auto rounded-2xl border border-border/80">
        <table className="w-full min-w-[860px] text-sm">
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
            {activeRecord.budgetData.map((category, categoryIndex) => (
              <BudgetCategoryRows
                categoryIndex={categoryIndex}
                categoryName={category.category}
                items={category.items}
                key={`${activeRecord.id}-${category.category}`}
                totals={getCategoryTotals(categoryIndex)}
                updateBudgetItem={updateBudgetItem}
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
    </div>
  );
}

function BudgetCategoryRows({
  categoryIndex,
  categoryName,
  items,
  totals,
  updateBudgetItem,
}: {
  categoryIndex: number;
  categoryName: string;
  items: Array<{ name: string; planned: number; actual: number }>;
  totals: { planned: number; actual: number; variance: number; variancePercent: number };
  updateBudgetItem: (
    categoryIndex: number,
    itemIndex: number,
    field: "planned" | "actual",
    value: number,
  ) => void;
}) {
  return (
    <>
      <tr className="bg-background/60">
        <td className="px-4 py-3 font-semibold text-foreground" colSpan={5}>
          {categoryName}
        </td>
      </tr>
      {items.map((item, itemIndex) => (
        <BudgetItemRow
          categoryIndex={categoryIndex}
          item={item}
          itemIndex={itemIndex}
          key={`${categoryName}-${item.name}-${itemIndex}`}
          updateBudgetItem={updateBudgetItem}
        />
      ))}
      <SummaryRow
        actual={totals.actual}
        label={`${categoryName} subtotal`}
        planned={totals.planned}
        subtle
        variance={totals.variance}
        variancePercent={totals.variancePercent}
      />
    </>
  );
}

function BudgetItemRow({
  categoryIndex,
  item,
  itemIndex,
  updateBudgetItem,
}: {
  categoryIndex: number;
  item: { name: string; planned: number; actual: number };
  itemIndex: number;
  updateBudgetItem: (
    categoryIndex: number,
    itemIndex: number,
    field: "planned" | "actual",
    value: number,
  ) => void;
}) {
  const variance = item.planned - item.actual;
  const variancePercent = item.planned > 0 ? (variance / item.planned) * 100 : 0;

  return (
    <tr className="border-t border-border/60 hover:bg-accent/40">
      <td className="px-4 py-3 text-muted-foreground">{item.name}</td>
      <td className="px-4 py-3">
        <BudgetAmountInput
          onValueChange={(value) => updateBudgetItem(categoryIndex, itemIndex, "planned", value)}
          value={item.planned}
        />
      </td>
      <td className="px-4 py-3">
        <BudgetAmountInput
          onValueChange={(value) => updateBudgetItem(categoryIndex, itemIndex, "actual", value)}
          value={item.actual}
        />
      </td>
      <td className={`px-4 py-3 text-right ${varianceClassName(variance)}`}>{formatINR(variance)}</td>
      <td className={`px-4 py-3 text-right ${varianceClassName(variance)}`}>
        {formatPercent(variancePercent)}
      </td>
    </tr>
  );
}

function BudgetAmountInput({
  onValueChange,
  value,
}: {
  onValueChange: (value: number) => void;
  value: number;
}) {
  const [draftValue, setDraftValue] = useState(value === 0 ? "" : String(value));

  useEffect(() => {
    setDraftValue(value === 0 ? "" : String(value));
  }, [value]);

  return (
    <div className="ml-auto flex w-[150px] items-center rounded-xl border border-input bg-background/70 px-3">
      <span className="mr-2 text-sm text-muted-foreground">Rs.</span>
      <input
        className="h-10 w-full bg-transparent text-right text-sm text-foreground outline-none"
        inputMode="numeric"
        onChange={(event) => {
          const sanitized = sanitizeAmountInput(event.target.value);
          setDraftValue(sanitized);
          onValueChange(sanitized ? Number(sanitized) : 0);
        }}
        placeholder="0"
        value={draftValue}
      />
    </div>
  );
}

export function SummaryRow({
  actual,
  label,
  planned,
  subtle = false,
  variance,
  variancePercent,
}: {
  actual: number;
  label: string;
  planned: number;
  subtle?: boolean;
  variance: number;
  variancePercent: number;
}) {
  return (
    <tr className={subtle ? "bg-muted/20" : "bg-primary/10"}>
      <td className="px-4 py-3 font-medium text-foreground">{label}</td>
      <td className="px-4 py-3 text-right text-foreground">{formatINR(planned)}</td>
      <td className="px-4 py-3 text-right text-foreground">{formatINR(actual)}</td>
      <td className={`px-4 py-3 text-right font-medium ${varianceClassName(variance)}`}>
        {formatINR(variance)}
      </td>
      <td className={`px-4 py-3 text-right font-medium ${varianceClassName(variance)}`}>
        {formatPercent(variancePercent)}
      </td>
    </tr>
  );
}
