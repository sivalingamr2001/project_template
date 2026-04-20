import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { BudgetCategoryTotals } from "@/features/budget/types";
import { BudgetItemRow } from "./BudgetItemRow";
import { SummaryRow } from "./SummaryRow";

interface BudgetCategoryRowsProps {
  categoryIndex: number;
  categoryName: string;
  items: Array<{ name: string; planned: number; actual: number }>;
  totals: BudgetCategoryTotals;
  updateBudgetItem: (
    categoryIndex: number,
    itemIndex: number,
    field: "planned" | "actual",
    value: number
  ) => void;
}

export function BudgetCategoryRows({
  categoryIndex,
  categoryName,
  items,
  totals,
  updateBudgetItem,
}: BudgetCategoryRowsProps) {
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
