import { api } from "@/shared/lib/axios";

import type { BudgetRecord, BudgetRecordSummary } from "../types";
import type { CreateBudgetCategoryRequest } from "./types.private";

export interface CreateBudgetRequest {
  employeeId: number;
  projectCode: string;
  productNo: string;
  productName: string;
  budgetData: CreateBudgetCategoryRequest[];
}

export interface UpdateBudgetRequest {
  projectCode: string;
  productNo: string;
  projectTitle: string;
  items: Array<{ itemId: number; planned: number; actual: number }>;
}

export async function getBudgets(): Promise<BudgetRecordSummary[]> {
  const { data } = await api.get<BudgetRecordSummary[]>("/budgets");
  return data;
}

export async function getBudgetById(budgetId: number): Promise<BudgetRecord> {
  const { data } = await api.get<BudgetRecord>(`/budgets/${budgetId}`);
  return data;
}

export async function getBudgetByProjectCode(projectCode: string): Promise<BudgetRecord> {
  const { data } = await api.get<BudgetRecord>(`/budgets/by-project/${encodeURIComponent(projectCode)}`);
  return data;
}

export async function getBudgetByProjectAndProduct(
  projectCode: string,
  productNo: string,
): Promise<BudgetRecord> {
  const encodedProject = encodeURIComponent(projectCode);
  const encodedProduct = encodeURIComponent(productNo);
  const { data } = await api.get<BudgetRecord>(`/budgets/by-project/${encodedProject}/product/${encodedProduct}`);
  return data;
}

export async function createBudget(input: CreateBudgetRequest): Promise<BudgetRecord> {
  const { data } = await api.post<BudgetRecord>("/budgets", input);
  return data;
}

export async function updateBudget(budgetId: number, input: UpdateBudgetRequest): Promise<BudgetRecord> {
  const { data } = await api.put<BudgetRecord>(`/budgets/${budgetId}`, input);
  return data;
}

