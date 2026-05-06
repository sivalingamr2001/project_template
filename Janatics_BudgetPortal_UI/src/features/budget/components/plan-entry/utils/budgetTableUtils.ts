import type { BudgetRecord } from "@/features/budget/types"

export function includeInTotals(item: { excludeFromTotals?: boolean }) {
  return !item.excludeFromTotals
}

export function sumIncludedPlanned(
  items: Array<{ planned: number; excludeFromTotals?: boolean }>
) {
  return items.reduce(
    (sum, item) => (includeInTotals(item) ? sum + item.planned : sum),
    0
  )
}

export function sumIncludedActual(
  items: Array<{ actual: number; excludeFromTotals?: boolean }>
) {
  return items.reduce(
    (sum, item) => (includeInTotals(item) ? sum + item.actual : sum),
    0
  )
}

export function getTotals(record: BudgetRecord) {
  const totalPlanned = record.budgetData.reduce(
    (sum, category) => sum + sumIncludedPlanned(category.items),
    0
  )
  const totalActual = record.budgetData.reduce(
    (sum, category) => sum + sumIncludedActual(category.items),
    0
  )
  const variance = totalPlanned - totalActual
  const variancePercent = totalPlanned > 0 ? (variance / totalPlanned) * 100 : 0

  return { totalPlanned, totalActual, variance, variancePercent }
}

export function getCategoryTotals(record: BudgetRecord, categoryIndex: number) {
  const category = record.budgetData[categoryIndex]

  const planned = sumIncludedPlanned(category.items)
  const actual = sumIncludedActual(category.items)
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
