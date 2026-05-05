import { BudgetAmountInput } from "./BudgetAmountInput"
import {
  formatINR,
  formatPercent,
  varianceClassName,
} from "./utils/budgetTableUtils"

interface BudgetItemRowProps {
  categoryIndex: number
  item: { name: string; planned: number; actual: number }
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
  isapproved
}: BudgetItemRowProps) {
  const variance = item.planned - item.actual
  const variancePercent = item.planned > 0 ? (variance / item.planned) * 100 : 0

  return (
    <tr className="border-t border-border/60 hover:bg-accent/40">
      <td className="px-4 py-3 text-muted-foreground">{item.name}</td>
      <td className="px-4 py-3">
        <BudgetAmountInput
          onValueChange={(value) =>
            updateBudgetItem(categoryIndex, itemIndex, "planned", value)
          }
          readOnly={isapproved}
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
