import { createContext } from "react"
import type { BudgetRecord } from "@/features/budget/types"

export interface BudgetContextType {
  // State
  budgetRecords: BudgetRecord[]
  activeRecord: BudgetRecord | null
  loading: boolean
  error: string | null

  // Actions
  fetchBudgetRecords: () => Promise<void>
  fetchBudgetRecord: (id: string) => Promise<void>
  fetchBudgetRecordById: (
    projectNumber: string,
    productNumber: string
  ) => Promise<void>
  createBudgetRecord: (
    record: Omit<BudgetRecord, "id">
  ) => Promise<BudgetRecord>
  updateBudgetRecord: (
    id: string,
    record: Partial<BudgetRecord>
  ) => Promise<BudgetRecord>
  deleteBudgetRecord: (id: string) => Promise<void>
  setActiveRecord: (record: BudgetRecord | null) => void
}

export const BudgetContext = createContext<BudgetContextType | undefined>(
  undefined
)
