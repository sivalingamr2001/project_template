import { useEffect, useState } from "react";

import { useBudget } from "@/features/budget/budget-context";
import { formatINR, formatPercent } from "@/features/budget/budget-format";
import {
  sanitizeAmountInput,
  varianceClassName,
} from "@/features/budget/budget-ui.utils";
import { ChevronDown, ChevronRight } from "lucide-react";

export function BudgetTable() {
  const { activeRecord, getCategoryTotals, getTotals, updateBudgetItem } =
    useBudget();

  if (!activeRecord) {
    return null;
  }

  const totals = getTotals();

  return (
    <div className="space-y-5">
      <div className="flex h-160 flex-col overflow-hidden rounded-none border border-border/80">
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-215 table-fixed text-sm">
            <colgroup>
              <col className="w-[40%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead className="text-sm uppercase tracking-wide text-muted-foreground">
              <tr className="sticky top-0 z-10 bg-muted/75 backdrop-blur-xs">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Cost Item
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Planned (INR)
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Actual (INR)
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Variance
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Var %
                </th>
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
            </tbody>
            <tfoot className="bg-background/95 backdrop-blur-2xl">
              <SummaryRow
                actual={totals.totalActual}
                label="Total Cost, Rs."
                planned={totals.totalPlanned}
                variance={totals.variance}
                variancePercent={totals.variancePercent}
                className="sticky bottom-0 z-10 border-t border-border/80 bg-muted/90"
              />
            </tfoot>
          </table>
        </div>
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
  totals: {
    planned: number;
    actual: number;
    variance: number;
    variancePercent: number;
  };
  updateBudgetItem: (
    categoryIndex: number,
    itemIndex: number,
    field: "planned" | "actual",
    value: number,
  ) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <tr
        className="bg-background/60 cursor-pointer hover:bg-background/80 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <td
          className="px-4 py-3 font-semibold text-foreground flex items-center gap-2"
          colSpan={5}
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          {categoryName}
        </td>
      </tr>

      {isOpen && (
        <>
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
      )}
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
  const variancePercent =
    item.planned > 0 ? (variance / item.planned) * 100 : 0;

  return (
    <tr className="border-t border-border/60 hover:bg-accent/40">
      <td className="px-4 py-3 text-muted-foreground">{item.name}</td>
      <td className="px-4 py-3">
        <BudgetAmountInput
          onValueChange={(value) =>
            updateBudgetItem(categoryIndex, itemIndex, "planned", value)
          }
          value={item.planned}
          type="planned"
        />
      </td>
      <td className="px-4 py-3">
        <BudgetAmountInput
          onValueChange={(value) =>
            updateBudgetItem(categoryIndex, itemIndex, "actual", value)
          }
          value={item.actual}
          type="actual"
        />
      </td>
      <td className={`px-4 py-3 text-right ${varianceClassName(variance)}`}>
        {formatINR(variance)}
      </td>
      <td className={`px-4 py-3 text-right ${varianceClassName(variance)}`}>
        {formatPercent(variancePercent)}
      </td>
    </tr>
  );
}

function BudgetAmountInput({
  onValueChange,
  value,
  type,
}: {
  onValueChange: (value: number) => void;
  value: number;
  type?: "planned" | "actual";
}) {
  const [draftValue, setDraftValue] = useState(
    value === 0 ? "" : String(value),
  );

  useEffect(() => {
    setDraftValue(value === 0 ? "" : String(value));
  }, [value]);

  return (
    <div className="ml-auto flex w-37.5 items-center rounded-xl border border-input bg-background/70 px-3">
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
        disabled={type === "actual"}
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
  className,
}: {
  actual: number;
  label: string;
  planned: number;
  subtle?: boolean;
  variance: number;
  variancePercent: number;
  className?: string;
}) {
  return (
    <tr
      className={`${
        subtle
          ? "border-blue-500/50 bg-blue-500/10 backdrop-blur-xl text-blue-600 dark:text-blue-400"
          : "border-emerald-500/50 bg-emerald-500/20 backdrop-blur-lg text-emerald-600 dark:text-emerald-400"
      } ${className ?? ""}`.trim()}
    >
      <td className="px-4 py-3 font-medium text-foreground">{label}</td>
      <td className="px-4 py-3 text-right text-foreground">
        {formatINR(planned)}
      </td>
      <td className="px-4 py-3 text-right text-foreground">
        {formatINR(actual)}
      </td>
      <td
        className={`px-4 py-3 text-right font-medium ${varianceClassName(variance)}`}
      >
        {formatINR(variance)}
      </td>
      <td
        className={`px-4 py-3 text-right font-medium ${varianceClassName(variance)}`}
      >
        {formatPercent(variancePercent)}
      </td>
    </tr>
  );
}
