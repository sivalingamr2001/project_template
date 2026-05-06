import { BudgetAmountInput } from "./BudgetAmountInput"
import type { BudgetItem } from "@/features/budget/types"
import {
  formatINR,
  formatPercent,
  varianceClassName,
} from "./utils/budgetTableUtils"

interface BudgetItemRowProps {
  categoryIndex: number
  item: BudgetItem
  itemIndex: number
  updateBudgetItem: (
    categoryIndex: number,
    itemIndex: number,
    field: "planned" | "actual",
    value: number
  ) => void
  isapproved: boolean
}

export function BudgetItemRow({
  categoryIndex,
  item,
  itemIndex,
  updateBudgetItem,
  isapproved,
}: BudgetItemRowProps) {
  const variance = item.planned - item.actual
  const variancePercent = item.planned > 0 ? (variance / item.planned) * 100 : 0
  const isReadOnlyPlanned = isapproved || item.isCalculated
  const rowClassName = item.isCalculated
    ? "border-t border-border/60 bg-muted/40 font-medium"
    : "border-t border-border/60 hover:bg-accent/40"
  const labelClassName = item.isSubItem
    ? "pl-8 text-muted-foreground"
    : item.isCalculated
      ? "text-foreground"
      : "text-muted-foreground"

  return (
    <tr className={rowClassName}>
      <td className={`px-4 py-3 ${labelClassName}`}>{item.name}</td>
      <td className="px-4 py-3">
        <BudgetAmountInput
          onValueChange={(value) =>
            updateBudgetItem(categoryIndex, itemIndex, "planned", value)
          }
          readOnly={isReadOnlyPlanned}
          value={item.planned}
        />
      </td>
      <td className="px-4 py-3">
        <BudgetAmountInput value={item.actual} readOnly={true} />
      </td>
      <td className={`px-4 py-3 text-right ${varianceClassName(variance)}`}>
        {formatINR(variance)}
      </td>
      <td className={`px-4 py-3 text-right ${varianceClassName(variance)}`}>
        {formatPercent(variancePercent)}
      </td>
    </tr>
  )
}
