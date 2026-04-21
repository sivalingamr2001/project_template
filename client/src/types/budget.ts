export interface BudgetRecord {
  id: string
  projectNumber: string       // "NPD-2025-07"
  productNumber: string       // "PROD-SOL-2025-07"
  productName: string
  phase: BudgetPhase
  status: 'active' | 'draft' | 'over-budget' | 'complete'
  fiscalYear: string          // "FY2024-25"
  lineItems: BudgetLineItem[]
  lastSyncedAt: string        // ISO timestamp from Oracle ERP
}

export type BudgetPhase =
  | 'Product Design'
  | 'Concept Development'
  | 'Prototype Development'
  | 'Product Testing'
  | 'Capital Equipment'
  | 'Field Validation'

export interface BudgetLineItem {
  id: string
  category: string
  subcategory: string
  plannedAmount: number       // in rupees
  actualAmount: number        // READ ONLY — from Oracle ERP
  period: {
    month?: number            // 1–12
    quarter?: 'Q1'|'Q2'|'Q3'|'Q4'
    fiscalYear: string
  }
}

export interface BudgetSummary {
  totalPlanned: number
  totalActual: number
  variance: number            // planned - actual (positive = under budget)
  variancePct: number
  utilisationPct: number
  activeProjects: number
}

export type ReportPeriod = 'monthly' | 'quarterly' | 'yearly'
