export interface BudgetLineItem {
  name: string
  planned: number
  actual: number
}

export interface BudgetCategory {
  category: string
  items: BudgetLineItem[]
}

export interface BudgetRecord {
  id: string
  projectHeader: {
    projectCode: string
    productNo: string
    productName: string
    lastUpdated: string
  }
  budgetData: BudgetCategory[]
}

export interface BudgetCategoryTotals {
  planned: number
  actual: number
  variance: number
  variancePercent: number
}
