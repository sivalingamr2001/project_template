import type { BudgetCategory, BudgetCategoryTotals } from "./types";

import { BudgetItemRow } from "./BudgetItemRow";
import { SummaryRow } from "./SummaryRow";

interface Props {
  category: BudgetCategory;
  categoryIndex: number;
  totals: BudgetCategoryTotals;
  onUpdateItem: (params: { categoryIndex: number; itemIndex: number; field: "planned" | "actual"; value: number }) => void;
}

export function BudgetCategoryRows({ category, categoryIndex, onUpdateItem, totals }: Props) {
  return (
    <>
      <tr className="bg-background/60">
        <td className="px-4 py-3 font-semibold text-foreground" colSpan={5}>
          {category.categoryName}
        </td>
      </tr>
      {category.items.map((item, itemIndex) => (
        <BudgetItemRow
          key={`${category.categoryId}-${item.itemId}`}
          categoryIndex={categoryIndex}
          item={item}
          itemIndex={itemIndex}
          onUpdate={onUpdateItem}
        />
      ))}
      <SummaryRow
        actual={totals.actual}
        label={`${category.categoryName} subtotal`}
        planned={totals.planned}
        subtle
        variance={totals.variance}
        variancePercent={totals.variancePercent}
      />
    </>
  );
}

