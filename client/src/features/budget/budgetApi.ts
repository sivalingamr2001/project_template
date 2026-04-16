import { api } from "@/shared/lib/axios";
import type { BudgetCategory, BudgetItem, BudgetRecord } from "./budget.types";

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
