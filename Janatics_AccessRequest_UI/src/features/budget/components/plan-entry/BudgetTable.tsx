import { useMemo, useEffect } from "react"
import type { BudgetRecord } from "@/features/budget/types"
import { BudgetCategoryRows } from "./BudgetCategoryRows"
import { SummaryRow } from "./SummaryRow"
import { getTotals, getCategoryTotals } from "./utils/budgetTableUtils"
import { useActualAmounts } from "../hooks/useActualAmounts"
import { mapActualAmountsToBudget } from "../../utils/actualAmountsUtils"

type BudgetTableProps = {
  record: BudgetRecord
  onRecordChange: (updatedRecord: BudgetRecord) => void
}

export function BudgetTable({ record, onRecordChange }: BudgetTableProps) {
  const totals = useMemo(() => getTotals(record), [record])

  // Fetch actual amounts from API
  const { actualAmounts, loading, error } = useActualAmounts(
    record.projectHeader.projectNumber,
    record.projectHeader.productNo
  )

  // When actual amounts are loaded, update the record with the fetched values
  useEffect(() => {
    if (!actualAmounts || actualAmounts.length === 0) {
      return
    }

    // Map actual amounts to budget structure
    const amountMap = mapActualAmountsToBudget(actualAmounts, record.budgetData)

    // Update record with actual amounts
    const updated = { ...record }
    updated.budgetData = updated.budgetData.map((category) => ({
      ...category,
      items: category.items.map((item) => ({
        ...item,
        actual:
          amountMap.get(`${category.category}|${item.name}`) || item.actual,
      })),
    }))

    // Only update if values actually changed
    const hasChanged = JSON.stringify(updated) !== JSON.stringify(record)
    if (hasChanged) {
      onRecordChange(updated)
    }
  }, [actualAmounts, record.budgetData])

  if (!record) {
    return null
  }

  function updateBudgetItem(
    categoryIndex: number,
    itemIndex: number,
    field: "planned" | "actual",
    value: number
  ) {
    const updated = { ...record }
    updated.budgetData = updated.budgetData.map((category, categoryIdx) => {
      if (categoryIdx !== categoryIndex) {
        return category
      }

      return {
        ...category,
        items: category.items.map((item, itemIdx) => {
          if (itemIdx !== itemIndex) {
            return item
          }
          return {
            ...item,
            [field]: value,
          }
        }),
      }
    })

    onRecordChange(updated)
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          ⚠️ Warning: {error}
        </div>
      )}

      {loading && (
        <div className="rounded-lg bg-blue-50/50 p-3 text-sm text-muted-foreground">
          ⏳ Loading actual amounts from database...
        </div>
      )}

      <div className="flex h-172 flex-col overflow-hidden rounded-b-lg border border-border/80">
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-215 table-fixed text-sm">
            <colgroup>
              <col className="w-[40%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead className="text-sm tracking-wide text-muted-foreground uppercase">
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
              {record.budgetData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No budget items have been added yet.
                  </td>
                </tr>
              ) : (
                record.budgetData.map((category, categoryIndex) => (
                  <BudgetCategoryRows
                    categoryIndex={categoryIndex}
                    categoryName={category.category}
                    items={category.items}
                    key={`${record.id}-${category.category}`}
                    totals={getCategoryTotals(record, categoryIndex)}
                    updateBudgetItem={updateBudgetItem}
                  />
                ))
              )}
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
  )
}
