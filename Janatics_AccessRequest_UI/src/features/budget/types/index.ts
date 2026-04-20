
import { api } from "@/shared/lib/api-client";

export interface BudgetItem {
  itemId?: number;
  name: string;
  planned: number;
  actual: number;
}

export interface BudgetCategory {
  categoryId?: number;
  category: string;
  items: BudgetItem[];
}

export interface ProjectHeaderData {
  productName: string;
  projectCode: string;
  productNo: string;
  phase: string;
  department: string;
  status: "ON TRACK" | "AT RISK";
  lastUpdated: string;
}

export interface BudgetRecord {
  id: string;
  projectHeader: ProjectHeaderData;
  budgetData: BudgetCategory[];
}

export type SearchFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
};

export interface BudgetTemplateCategory {
  category: string;
  items: string[];
}

export interface BudgetStoreState {
  activeRecordId: string | null;
  records: BudgetRecord[];
}

export interface BudgetTotals {
  totalPlanned: number;
  totalActual: number;
  variance: number;
  variancePercent: number;
}

export interface BudgetCategoryTotals {
  planned: number;
  actual: number;
  variance: number;
  variancePercent: number;
}

export type BudgetRecordSummaryResponse = {
  budgetId: number;
  projectCode: string;
  productNo: string;
  projectTitle: string;
  employeeId: number;
  modifiedOn: string;
};

export type BudgetItemResponse = {
  itemId: number;
  itemName: string;
  planned: number;
  actual: number;
};

export type BudgetCategoryResponse = {
  categoryId: number;
  categoryName: string;
  items: BudgetItemResponse[];
};

export type BudgetRecordResponse = {
  header: {
    budgetId: number;
    employeeId: number;
    projectCode: string;
    productNo: string;
    projectTitle: string;
    createdOn: string;
    modifiedOn: string;
  };
  categories: BudgetCategoryResponse[];
};

export type CreateBudgetRequest = {
  employeeId: number;
  projectCode: string;
  productNo: string;
  projectTitle: string;
  budgetData?: {
    category: string;
    items: {
      name: string;
      planned: number;
      actual: number;
    }[];
  }[];
};

export type UpdateBudgetRequest = {
  projectCode: string;
  productNo: string;
  projectTitle: string;
  items: {
    itemId: number;
    planned: number;
    actual: number;
  }[];
};

export async function getBudgetSummaries() {
  const response = await api.get<BudgetRecordSummaryResponse[]>("/budgets");
  return response.data;
}

export async function getBudgetById(budgetId: number) {
  const response = await api.get<BudgetRecordResponse>(`/budgets/${budgetId}`);
  return response.data;
}

export async function getBudgetByProjectCode(projectCode: string) {
  const encodedProjectCode = encodeURIComponent(projectCode);
  const response = await api.get<BudgetRecordResponse>(`/budgets/by-project/${encodedProjectCode}`);
  return response.data;
}

export async function getBudgetByProductNo(productNo: string) {
  const encodedProductNo = encodeURIComponent(productNo);
  const response = await api.get<BudgetRecordResponse>(`/budgets/by-project/${encodedProductNo}`);
  return response.data;
}

export async function getBudgetByProjectCodeAndProductNo(
  projectCode: string,
  productNo: string,
) {
  const encodedProjectCode = encodeURIComponent(projectCode);
  const encodedProductNo = encodeURIComponent(productNo);
  const response = await api.get<BudgetRecordResponse>(
    `/budgets/by-project/${encodedProjectCode}/product/${encodedProductNo}`,
  );
  return response.data;
}

export async function createBudget(request: CreateBudgetRequest) {
  const response = await api.post<BudgetRecordResponse>("/budgets", request);
  return response.data;
}

export async function updateBudget(
  budgetId: number,
  request: UpdateBudgetRequest,
) {
  const response = await api.put<BudgetRecordResponse>(`/budgets/${budgetId}`, request);
  return response.data;
}

export async function deleteBudget(budgetId: number) {
  await api.delete(`/budgets/${budgetId}`);
}

export function mapBudgetApiToUi(response: BudgetRecordResponse): BudgetRecord {
  const categories: BudgetCategory[] = response.categories.map(
    (category) => ({
      categoryId: category.categoryId,
      category: category.categoryName,
      items: category.items.map((item) => ({
        itemId: item.itemId,
        name: item.itemName,
        planned: item.planned,
        actual: item.actual,
      })),
    }),
  );

  const totalPlanned = categories.reduce(
    (sum, category) =>
      sum + category.items.reduce((itemSum, item) => itemSum + item.planned, 0),
    0,
  );

  const totalActual = categories.reduce(
    (sum, category) =>
      sum + category.items.reduce((itemSum, item) => itemSum + item.actual, 0),
    0,
  );

  return {
    id: response.header.budgetId.toString(),
    projectHeader: {
      productName: response.header.projectTitle,
      projectCode: response.header.projectCode,
      productNo: response.header.productNo,
      phase: "Product development",
      department: "Research and Development",
      status: totalPlanned - totalActual < 0 ? "AT RISK" : "ON TRACK",
      lastUpdated: response.header.modifiedOn ?? response.header.createdOn,
    },
    budgetData: categories,
  };
}

// Actual Amounts Types & Services
export interface ActualAmountItem {
  category: string;
  subCategory: string;
  amount: number;
}

export interface ActualAmountsRequest {
  projectCode: string;
  productNo: string;
}

export interface ActualAmountsResponse {
  projectCode: string;
  productNo: string;
  items: ActualAmountItem[];
  lastUpdated: string;
}

export async function getActualAmounts(
  projectCode: string,
  productNo: string
) {
  const response = await api.post<ActualAmountsResponse>("/budgets/actual-amounts", {
    projectCode,
    productNo,
  });
  return response.data;
}

// Validator: Check if category and sub-category match the budget structure
export function validateAndMapActualAmounts(
  actualAmounts: ActualAmountItem[],
  budgetCategories: BudgetCategory[]
): Map<string, number> {
  const actualAmountsMap = new Map<string, number>();

  actualAmounts.forEach((item) => {
    // Create a normalized key for matching
    const actualKey = `${item.category.toLowerCase().trim()}|${item.subCategory.toLowerCase().trim()}`;

    // Find matching category and item in budget
    const matchedCategory = budgetCategories.find(
      (cat) => cat.category.toLowerCase().trim() === item.category.toLowerCase().trim()
    );

    if (matchedCategory) {
      const matchedItem = matchedCategory.items.find(
        (budgetItem) =>
          budgetItem.name.toLowerCase().trim() === item.subCategory.toLowerCase().trim()
      );

      if (matchedItem) {
        // Store the mapping for later use
        actualAmountsMap.set(actualKey, item.amount);
      }
    }
  });

  return actualAmountsMap;
}

