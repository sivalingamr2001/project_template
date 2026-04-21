import { AlertCircle, CheckCircle2 } from "lucide-react"
import type { ActualAmountItem, BudgetCategory } from "../types"
import { validateBudgetAgainstActuals } from "../utils/actualAmountsUtils"

interface BudgetValidationAlertProps {
  actualAmounts: ActualAmountItem[] | null
  budgetCategories: BudgetCategory[]
}

export function BudgetValidationAlert({
  actualAmounts,
  budgetCategories,
}: BudgetValidationAlertProps) {
  if (!actualAmounts || actualAmounts.length === 0) {
    return null
  }

  const { isValid, missingItems, unmappedActuals } =
    validateBudgetAgainstActuals(actualAmounts, budgetCategories)

  if (isValid) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
        <CheckCircle2 size={16} />
        <span>All budget items successfully mapped to actual amounts</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {missingItems.length > 0 && (
        <div className="flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Missing actual amounts for:</p>
            <ul className="mt-1 ml-4 list-disc space-y-1 text-xs">
              {missingItems.slice(0, 3).map((item, idx) => (
                <li key={idx}>
                  {item.category} → {item.item}
                </li>
              ))}
              {missingItems.length > 3 && (
                <li>...and {missingItems.length - 3} more</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {unmappedActuals.length > 0 && (
        <div className="flex gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Unmapped actual amounts:</p>
            <ul className="mt-1 ml-4 list-disc space-y-1 text-xs">
              {unmappedActuals.slice(0, 3).map((item, idx) => (
                <li key={idx}>
                  {item.category} → {item.subCategory} (Rs. {item.amount})
                </li>
              ))}
              {unmappedActuals.length > 3 && (
                <li>...and {unmappedActuals.length - 3} more</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
