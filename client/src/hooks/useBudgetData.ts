import type { BudgetRecord, BudgetSummary, BudgetLineItem } from '@/types/budget'
import budgetRecordData from '@/data/budgetRecord.json'

const fiscalMonths = [
  '',
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const fiscalOrder = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]

const quarterDefinitions: Record<string, number[]> = {
  Q1: [4, 5, 6],
  Q2: [7, 8, 9],
  Q3: [10, 11, 12],
  Q4: [1, 2, 3],
}

type RawBudgetRecord = {
  id: string
  projectHeader: {
    productName: string
    projectCode: string
    productNo: string
    phase: string
    department?: string
    status: string
    lastUpdated: string
  }
  summary?: {
    totalPlanned: number
    totalActual: number
    overallVariance: number
    currency: string
  }
  budgetData: Array<{
    category: string
    items: Array<{ name: string; planned: number; actual: number }>
  }>
}

function mapPhase(phase: string): BudgetRecord['phase'] {
  const normalized = phase.toLowerCase()
  if (normalized.includes('product') && normalized.includes('design')) return 'Product Design'
  if (normalized.includes('product') && normalized.includes('development')) return 'Product Design'
  if (normalized.includes('concept')) return 'Concept Development'
  if (normalized.includes('prototype')) return 'Prototype Development'
  if (normalized.includes('testing')) return 'Product Testing'
  if (normalized.includes('capital')) return 'Capital Equipment'
  if (normalized.includes('field')) return 'Field Validation'
  return 'Product Design'
}

function mapStatus(status: string): BudgetRecord['status'] {
  const normalized = status.toLowerCase()
  if (normalized.includes('over')) return 'over-budget'
  if (normalized.includes('complete')) return 'complete'
  if (normalized.includes('draft')) return 'draft'
  return 'active'
}

function getFiscalYear(dateString: string) {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  if (month >= 4) {
    return `FY${year}-${String(year + 1).slice(-2)}`
  }
  return `FY${year - 1}-${String(year).slice(-2)}`
}

function getBudgetLineItems(raw: RawBudgetRecord): BudgetLineItem[] {
  const fiscalYear = getFiscalYear(raw.projectHeader.lastUpdated)

  return raw.budgetData.flatMap((category, categoryIndex) =>
    category.items.map((item, itemIndex) => {
      const month = ((categoryIndex * 3 + itemIndex) % 12) + 1
      return {
        id: `${raw.id}-${category.category}-${item.name}`,
        category: category.category,
        subcategory: item.name,
        plannedAmount: item.planned,
        actualAmount: item.actual,
        period: {
          month,
          fiscalYear,
        },
      }
    })
  )
}

const budgets: BudgetRecord[] = (budgetRecordData as RawBudgetRecord[]).map((raw) => ({
  id: raw.id,
  projectNumber: raw.projectHeader.projectCode,
  productNumber: raw.projectHeader.productNo,
  productName: raw.projectHeader.productName,
  phase: mapPhase(raw.projectHeader.phase),
  status: mapStatus(raw.projectHeader.status),
  fiscalYear: getFiscalYear(raw.projectHeader.lastUpdated),
  lastSyncedAt: raw.projectHeader.lastUpdated,
  lineItems: getBudgetLineItems(raw),
}))

function getProjectBudgets(projectNumber?: string) {
  return projectNumber
    ? budgets.filter((budget) => budget.projectNumber === projectNumber)
    : budgets
}

function getLineItems(projectNumber?: string) {
  return getProjectBudgets(projectNumber).flatMap((budget) => budget.lineItems)
}

function sumValues(
  items: Array<{ plannedAmount: number; actualAmount: number }>,
  field: 'plannedAmount' | 'actualAmount'
) {
  return items.reduce((acc, item) => acc + item[field], 0)
}

function buildMonthlyTrend(projectNumber?: string) {
  const items = getLineItems(projectNumber)

  return fiscalOrder.map((month) => {
    const monthItems = items.filter((item) => item.period.month === month)
    const planned = sumValues(monthItems, 'plannedAmount')
    const actual = sumValues(monthItems, 'actualAmount')

    return {
      month,
      label: fiscalMonths[month],
      planned,
      actual,
      variance: planned - actual,
    }
  })
}

function buildQuarterlyTrend(projectNumber?: string) {
  const items = getLineItems(projectNumber)

  return (Object.entries(quarterDefinitions) as [string, number[]][]).map(
    ([quarter, months]) => {
      const quarterItems = items.filter(
        (item) => item.period.month && months.includes(item.period.month)
      )
      const planned = sumValues(quarterItems, 'plannedAmount')
      const actual = sumValues(quarterItems, 'actualAmount')
      return {
        month: quarter,
        label: quarter,
        planned,
        actual,
        variance: planned - actual,
      }
    }
  )
}

function buildYearlyTrend(projectNumber?: string) {
  const items = getLineItems(projectNumber)
  const years = Array.from(new Set(items.map((item) => item.period.fiscalYear)))

  return years.map((year) => {
    const yearItems = items.filter((item) => item.period.fiscalYear === year)
    const planned = sumValues(yearItems, 'plannedAmount')
    const actual = sumValues(yearItems, 'actualAmount')
    return {
      month: year,
      label: year,
      planned,
      actual,
      variance: planned - actual,
    }
  })
}

export function useBudgetSummary(): BudgetSummary {
  const activeBudgets = budgets.filter((budget) => budget.status === 'active')
  const totalPlanned = sumValues(
    activeBudgets.flatMap((budget) => budget.lineItems),
    'plannedAmount'
  )
  const totalActual = sumValues(budgets.flatMap((budget) => budget.lineItems), 'actualAmount')
  const variance = totalPlanned - totalActual
  const variancePct = totalPlanned ? (variance / totalPlanned) * 100 : 0
  const utilisationPct = totalPlanned ? (totalActual / totalPlanned) * 100 : 0

  return {
    totalPlanned,
    totalActual,
    variance,
    variancePct,
    utilisationPct,
    activeProjects: activeBudgets.length,
  }
}

export function useProjectBudgets() {
  return budgets
}

export function useProjectBudget(projectNumber: string) {
  return budgets.find((budget) => budget.projectNumber === projectNumber)
}

export function useMonthlyTrend(projectNumber?: string) {
  return buildMonthlyTrend(projectNumber)
}

export function useQuarterlyTrend(projectNumber?: string) {
  return buildQuarterlyTrend(projectNumber)
}

export function useYearlyTrend(projectNumber?: string) {
  return buildYearlyTrend(projectNumber)
}
