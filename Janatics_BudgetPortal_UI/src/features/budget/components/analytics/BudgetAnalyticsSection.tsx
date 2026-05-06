import type { BudgetRecord, BudgetTotals } from "@/features/budget/types"
import {
  includeInTotals,
  sumIncludedActual,
  sumIncludedPlanned,
} from "../plan-entry/utils/budgetTableUtils"
import { PerformanceReportSection } from "./report/PerformanceReportSection"

interface AnalyticsCategoryData {
  category: string
  planned: number
  actual: number
  variance: number
  utilization: number
}

interface VarianceItem {
  name: string
  category: string
  amount: number
  percent: number
  type: "under" | "over"
}

function getAnalyticsData(record: BudgetRecord) {
  const categories: AnalyticsCategoryData[] = record.budgetData.map(
    (category) => {
      const planned = sumIncludedPlanned(category.items)
      const actual = sumIncludedActual(category.items)
      const variance = planned - actual
      const utilization = planned ? (actual / planned) * 100 : 0

      return {
        category: category.category,
        planned,
        actual,
        variance,
        utilization,
      }
    }
  )

  const totals: BudgetTotals = categories.reduce(
    (acc, next) => ({
      totalPlanned: acc.totalPlanned + next.planned,
      totalActual: acc.totalActual + next.actual,
      variance: acc.variance + next.variance,
      variancePercent: 0,
    }),
    {
      totalPlanned: 0,
      totalActual: 0,
      variance: 0,
      variancePercent: 0,
    }
  )

  totals.variancePercent = totals.totalPlanned
    ? ((totals.totalPlanned - totals.totalActual) / totals.totalPlanned) * 100
    : 0

  const varianceItems: VarianceItem[] = record.budgetData
    .flatMap((category) =>
      category.items.filter(includeInTotals).map((item) => {
        const amount = item.planned - item.actual
        const percent = item.planned
          ? (Math.abs(amount) / item.planned) * 100
          : 0

        const status: VarianceItem["type"] = amount >= 0 ? "under" : "over"

        return {
          name: item.name,
          category: category.category,
          amount,
          percent,
          type: status,
        }
      })
    )
    .sort((left, right) => Math.abs(right.amount) - Math.abs(left.amount))
    .slice(0, 4)

  return {
    categories,
    totals,
    varianceItems,
  }
}

export function BudgetAnalyticsSection({ record }: { record: BudgetRecord }) {
  const { categories, totals } = getAnalyticsData(record)

  return (
    <div className="mb-2 grid gap-6 xl:grid-cols-2">
      <div className="xl:col-span-2">
        <PerformanceReportSection totals={totals} categories={categories} />
      </div>
      {/* <CategoryComparisonChart categories={categories} />
      <BudgetUtilisationChart totals={totals} categories={categories} />
      <VarianceHighlights items={varianceItems} />
      <PhaseProgress phaseName={record.projectHeader.phase} /> */}
    </div>
  )
}
