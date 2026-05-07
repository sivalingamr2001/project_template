import { api } from "@/shared/lib/api-client"

export interface BudgetItem {
  itemId?: number
  name: string
  planned: number
  actual: number
  excludeFromTotals?: boolean
  isCalculated?: boolean
  calculationType?: "multiply"
  operandNames?: string[]
  subCategory?: string
  isSubItem?: boolean
}

export interface BudgetCategory {
  categoryId?: number
  category: string
  items: BudgetItem[]
}

export interface ProjectHeaderData {
  id?: number
  employeeId: number
  productName: string
  projectNumber: string
  productNo: string
  phase: string
  department: string
  status: string
  approvalStatus?: string
  isActive?: boolean
  lastUpdated: string
  templateId?: number
}

export interface BudgetRecord {
  id: string
  projectHeader: ProjectHeaderData
  budgetData: BudgetCategory[]
}

export interface BudgetSummary {
  // Monetary Values
  totalPlanned: number
  totalActual: number
  variance: number

  // Percentages
  variancePct: number
  utilisationPct: number

  // Project Metadata
  activeProjects: number

  // Date Metadata
  appliedFrom: string // ISO Date String
  appliedTo: string // ISO Date String
  generatedAt: string // ISO Date String
}

export type SearchFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  size?: "sm" | "md" | "lg"
}

export interface BudgetTemplateCategory {
  category: string
  items: BudgetTemplateItem[]
  subCategories?: BudgetTemplateSubCategory[]
}

export interface BudgetTemplateItem {
  name: string
}

export interface BudgetTemplateSubCategory {
  name: string
  items: BudgetTemplateItem[]
}

export interface BudgetStoreState {
  activeRecordId: string | null
  records: BudgetRecord[]
}

export interface BudgetTotals {
  totalPlanned: number
  totalActual: number
  variance: number
  variancePercent: number
}

export interface BudgetCategoryTotals {
  planned: number
  actual: number
  variance: number
  variancePercent: number
}

export type BudgetRecordSummaryResponse = {
  budgetId: number
  projectNumber: string
  productNo: string
  projectTitle: string
  employeeId: number
  modifiedOn: string
  approvalStatus: string
  isActive: boolean
}

export type BudgetItemResponse = {
  itemId: number
  itemName: string
  planned: number
  actual: number
}

export type BudgetCategoryResponse = {
  categoryId: number
  categoryName: string
  items: BudgetItemResponse[]
}

export type BudgetRecordResponse = {
  header: {
    budgetId: number
    employeeId: number
    projectNumber: string
    productNo: string
    projectTitle: string
    productName?: string
    approvalStatus?: string
    isActive?: boolean
    createdOn: string
    modifiedOn: string
    templateId?: number
  }
  categories: BudgetCategoryResponse[]
  templateStructure?: BudgetTemplateCategory[]
}

export type CreateBudgetRequest = {
  employeeId: number
  projectNumber: string
  productNo: string
  productName?: string
  projectTitle?: string
  budgetData?: {
    category: string
    items: {
      name: string
      planned: number
      actual: number
    }[]
  }[]
}

export type UpdateBudgetRequest = {
  budgetId: number
  modifiedBy: number
  modifedOn: string
  items: {
    itemId: number
    categoryId: number | undefined
    planned: number
  }[]
}

export async function getBudgetSummaries() {
  const response = await api.get<BudgetRecordSummaryResponse[]>("/budgets")
  return response.data
}

export async function getBudgetById(budgetId: number) {
  const response = await api.get<BudgetRecordResponse>(`/budgets/${budgetId}`)
  return response.data
}

export async function getBudgetByprojectNumber(projectNumber: string) {
  const encodedprojectNumber = encodeURIComponent(projectNumber)
  const response = await api.get<BudgetRecordResponse>(
    `/budgets/by-project/${encodedprojectNumber}`
  )
  return response.data
}

export async function getBudgetByProductNo(productNo: string) {
  const encodedProductNo = encodeURIComponent(productNo)
  const response = await api.get<BudgetRecordResponse>(
    `/budgets/by-project/${encodedProductNo}`
  )
  return response.data
}

export async function getBudgetByprojectNumberAndProductNo(
  projectNumber: string,
  productNo: string
) {
  const encodedprojectNumber = encodeURIComponent(projectNumber)
  const encodedProductNo = encodeURIComponent(productNo)
  const response = await api.get<BudgetRecordResponse>(
    `/budgets/by-project/${encodedprojectNumber}/product/${encodedProductNo}`
  )
  return response.data
}

export async function createBudget(request: CreateBudgetRequest) {
  const response = await api.post<BudgetRecordResponse>("/budgets", request)
  return response.data
}

export async function updateBudget(
  budgetId: number,
  request: UpdateBudgetRequest
) {
  const response = await api.put<BudgetRecordResponse>(
    `/budgets/${budgetId}/amounts`,
    request
  )
  return response.data
}

export async function deleteBudget(budgetId: number) {
  await api.delete(`/budgets/${budgetId}`)
}

export function mapBudgetApiToUi(response: BudgetRecordResponse): BudgetRecord {
  const categories: BudgetCategory[] = response.categories.map((category) => ({
    categoryId: category.categoryId,
    category: category.categoryName,
    items: category.items.map((item) => ({
      itemId: item.itemId,
      name: item.itemName,
      planned: item.planned,
      actual: item.actual,
    })),
  }))

  const totalPlanned = categories.reduce(
    (sum, category) =>
      sum + category.items.reduce((itemSum, item) => itemSum + item.planned, 0),
    0
  )

  const totalActual = categories.reduce(
    (sum, category) =>
      sum + category.items.reduce((itemSum, item) => itemSum + item.actual, 0),
    0
  )

  return {
    id: response.header.budgetId.toString(),
    projectHeader: {
      id: response.header.budgetId,
      employeeId: response.header.employeeId,
      productName: response.header.productName ?? response.header.projectTitle,
      projectNumber: response.header.projectNumber,
      productNo: response.header.productNo,
      phase: "Product development",
      department: "Research and Development",
      status: totalPlanned - totalActual < 0 ? "AT RISK" : "ON TRACK",
      approvalStatus: response.header.approvalStatus,
      isActive: response.header.isActive,
      lastUpdated: response.header.modifiedOn ?? response.header.createdOn,
    },
    budgetData: categories,
  }
}

// Actual Amounts Types & Services
export interface ActualAmountItem {
  category: string
  subCategory: string
  amount: number
}

export interface ActualAmountsRequest {
  projectNumber: string
  productNo: string
}

export interface ActualAmountsResponse {
  projectNumber: string
  productNo: string
  items: ActualAmountItem[]
  lastUpdated: string
}

export async function getActualAmounts(
  projectNumber: string,
  productNo: string
) {
  const response = await api.post<ActualAmountsResponse>(
    "/budgets/actual-amounts",
    {
      projectNumber,
      productNo,
    }
  )
  return response.data
}

// Validator: Check if category and sub-category match the budget structure
export function validateAndMapActualAmounts(
  actualAmounts: ActualAmountItem[],
  budgetCategories: BudgetCategory[]
): Map<string, number> {
  const actualAmountsMap = new Map<string, number>()

  actualAmounts.forEach((item) => {
    // Create a normalized key for matching
    const actualKey = `${item.category.toLowerCase().trim()}|${item.subCategory.toLowerCase().trim()}`

    // Find matching category and item in budget
    const matchedCategory = budgetCategories.find(
      (cat) =>
        cat.category.toLowerCase().trim() === item.category.toLowerCase().trim()
    )

    if (matchedCategory) {
      const matchedItem = matchedCategory.items.find(
        (budgetItem) =>
          budgetItem.name.toLowerCase().trim() ===
          item.subCategory.toLowerCase().trim()
      )

      if (matchedItem) {
        // Store the mapping for later use
        actualAmountsMap.set(actualKey, item.amount)
      }
    }
  })

  return actualAmountsMap
}
