import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { BudgetCategoryTotals } from "@/features/budget/types"
import { BudgetItemRow } from "./BudgetItemRow"
import { SummaryRow } from "./SummaryRow"

interface BudgetCategoryRowsProps {
  categoryIndex: number
  categoryName: string
  items: Array<{ name: string; planned: number; actual: number }>
  totals: BudgetCategoryTotals
  updateBudgetItem: (
    categoryIndex: number,
    itemIndex: number,
    field: "planned" | "actual",
    value: number
  ) => void
  isapproved: boolean
}

export function BudgetCategoryRows({
  categoryIndex,
  categoryName,
  items,
  totals,
  updateBudgetItem,
  isapproved,
}: BudgetCategoryRowsProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      <tr
        className="cursor-pointer bg-background/60 transition-colors hover:bg-background/80"
        onClick={() => setIsOpen(!isOpen)}
      >
        <td
          className="flex items-center gap-2 px-4 py-3 font-semibold text-foreground"
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
              isapproved={isapproved}
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
  )
}
