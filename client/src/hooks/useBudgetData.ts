import type {
  BudgetRecord,
  BudgetSummary,
} from "@/types/budget"

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

const mockBudgets: BudgetRecord[] = [
  {
    id: 'budget-001',
    projectNumber: 'NPD-2025-01',
    productNumber: 'PROD-SOL-2025-01',
    productName: 'Smart Home Hub',
    phase: 'Product Design',
    status: 'active',
    fiscalYear: 'FY2024-25',
    lastSyncedAt: '2025-03-28T14:12:00Z',
    lineItems: [
      {
        id: 'li-001',
        category: 'Engineering',
        subcategory: 'Hardware',
        plannedAmount: 4500000,
        actualAmount: 4200000,
        period: { month: 4, fiscalYear: 'FY2024-25' },
      },
      {
        id: 'li-002',
        category: 'Engineering',
        subcategory: 'Software',
        plannedAmount: 3200000,
        actualAmount: 3050000,
        period: { month: 5, fiscalYear: 'FY2024-25' },
      },
      {
        id: 'li-003',
        category: 'Design',
        subcategory: 'UX',
        plannedAmount: 1250000,
        actualAmount: 1180000,
        period: { month: 6, fiscalYear: 'FY2024-25' },
      },
      {
        id: 'li-004',
        category: 'Testing',
        subcategory: 'Lab',
        plannedAmount: 980000,
        actualAmount: 1040000,
        period: { month: 7, fiscalYear: 'FY2024-25' },
      },
      {
        id: 'li-005',
        category: 'Capital Equipment',
        subcategory: 'Fixtures',
        plannedAmount: 1620000,
        actualAmount: 1560000,
        period: { month: 8, fiscalYear: 'FY2024-25' },
      },
      {
        id: 'li-006',
        category: 'Marketing',
        subcategory: 'Launch',
        plannedAmount: 820000,
        actualAmount: 760000,
        period: { month: 9, fiscalYear: 'FY2024-25' },
      },
      {
        id: 'li-007',
        category: 'Risk',
        subcategory: 'Contingency',
        plannedAmount: 450000,
        actualAmount: 400000,
        period: { month: 10, fiscalYear: 'FY2024-25' },
      },
    ],
  },
  {
    id: 'budget-002',
    projectNumber: 'NPD-2025-02',
    productNumber: 'PROD-SOL-2025-02',
    productName: 'Autonomous Drone',
    phase: 'Prototype Development',
    status: 'over-budget',
    fiscalYear: 'FY2024-25',
    lastSyncedAt: '2025-03-25T10:05:00Z',
    lineItems: [
      {
        id: 'li-011',
        category: 'Engineering',
        subcategory: 'Aerodynamics',
        plannedAmount: 5200000,
        actualAmount: 5400000,
        period: { month: 4, fiscalYear: 'FY2024-25' },
      },
      {
        id: 'li-012',
        category: 'Prototype',
        subcategory: 'Frame',
        plannedAmount: 2300000,
        actualAmount: 2480000,
        period: { month: 5, fiscalYear: 'FY2024-25' },
      },
      {
        id: 'li-013',
        category: 'Testing',
        subcategory: 'Field',
        plannedAmount: 1780000,
        actualAmount: 1900000,
        period: { month: 6, fiscalYear: 'FY2024-25' },
      },
      {
        id: 'li-014',
        category: 'Engineering',
        subcategory: 'Control Systems',
        plannedAmount: 2100000,
        actualAmount: 2200000,
        period: { month: 7, fiscalYear: 'FY2024-25' },
      },
      {
        id: 'li-015',
        category: 'Certification',
        subcategory: 'Compliance',
        plannedAmount: 1120000,
        actualAmount: 960000,
        period: { month: 8, fiscalYear: 'FY2024-25' },
      },
      {
        id: 'li-016',
        category: 'Support',
        subcategory: 'Warranty',
        plannedAmount: 770000,
        actualAmount: 690000,
        period: { month: 9, fiscalYear: 'FY2024-25' },
      },
    ],
  },
  {
    id: 'budget-003',
    projectNumber: 'NPD-2025-03',
    productNumber: 'PROD-SOL-2025-03',
    productName: 'Urban Electric Scooter',
    phase: 'Field Validation',
    status: 'active',
    fiscalYear: 'FY2024-25',
    lastSyncedAt: '2025-03-27T18:32:00Z',
    lineItems: [
      {
        id: 'li-021',
        category: 'Engineering',
        subcategory: 'Motor',
        plannedAmount: 3800000,
        actualAmount: 3450000,
        period: { month: 4, fiscalYear: 'FY2024-25' },
      },
      {
        id: 'li-022',
        category: 'Production',
        subcategory: 'Battery',
        plannedAmount: 1980000,
        actualAmount: 2050000,
        period: { month: 5, fiscalYear: 'FY2024-25' },
      },
      {
        id: 'li-023',
        category: 'Design',
        subcategory: 'Chassis',
        plannedAmount: 910000,
        actualAmount: 870000,
        period: { month: 6, fiscalYear: 'FY2024-25' },
      },
      {
        id: 'li-024',
        category: 'Testing',
        subcategory: 'Safety',
        plannedAmount: 760000,
        actualAmount: 720000,
        period: { month: 7, fiscalYear: 'FY2024-25' },
      },
      {
        id: 'li-025',
        category: 'Field Validation',
        subcategory: 'Pilot Runs',
        plannedAmount: 1040000,
        actualAmount: 980000,
        period: { month: 8, fiscalYear: 'FY2024-25' },
      },
    ],
  },
]

function getProjectBudgets(projectNumber?: string) {
  return projectNumber
    ? mockBudgets.filter((budget) => budget.projectNumber === projectNumber)
    : mockBudgets
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

  return (Object.entries(quarterDefinitions) as [string, number[]][]) .map(([quarter, months]) => {
    const quarterItems = items.filter((item) => item.period.month && months.includes(item.period.month))
    const planned = sumValues(quarterItems, 'plannedAmount')
    const actual = sumValues(quarterItems, 'actualAmount')
    return {
      month: quarter,
      label: quarter,
      planned,
      actual,
      variance: planned - actual,
    }
  })
}

function buildYearlyTrend(projectNumber?: string) {
  const items = getLineItems(projectNumber)
  const years = ['FY2022-23', 'FY2023-24', 'FY2024-25']

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
  const activeBudgets = mockBudgets.filter((budget) => budget.status === 'active')
  const totalPlanned = sumValues(
    activeBudgets.flatMap((budget) => budget.lineItems),
    'plannedAmount'
  )
  const totalActual = sumValues(mockBudgets.flatMap((budget) => budget.lineItems), 'actualAmount')
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
  return mockBudgets
}

export function useProjectBudget(projectNumber: string) {
  return mockBudgets.find((budget) => budget.projectNumber === projectNumber)
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
