import type { BudgetRecord } from "@/features/budget/types"

export function getTotals(record: BudgetRecord) {
  const totalPlanned = record.budgetData.reduce(
    (sum, category) => sum + category.items.reduce((itemSum, item) => itemSum + item.planned, 0),
    0,
  )
  const totalActual = record.budgetData.reduce(
    (sum, category) => sum + category.items.reduce((itemSum, item) => itemSum + item.actual, 0),
    0,
  )
  const variance = totalPlanned - totalActual
  const variancePercent = totalPlanned > 0 ? (variance / totalPlanned) * 100 : 0

  return { totalPlanned, totalActual, variance, variancePercent }
}

export function getCategoryTotals(
  record: BudgetRecord,
  categoryIndex: number,
) {
  const category = record.budgetData[categoryIndex]

  const planned = category.items.reduce((sum, item) => sum + item.planned, 0)
  const actual = category.items.reduce((sum, item) => sum + item.actual, 0)
  const variance = planned - actual
  const variancePercent = planned > 0 ? (variance / planned) * 100 : 0

  return { planned, actual, variance, variancePercent }
}

export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

export function varianceClassName(value: number) {
  return value >= 0 ? "text-emerald-600" : "text-destructive"
}

export function sanitizeAmountInput(value: string) {
  return value.replace(/[^\d.]/g, "").replace(/^0+(?=\d)/, "")
}
