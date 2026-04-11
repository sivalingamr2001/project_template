export interface CreateBudgetItemRequest {
  name: string;
  planned: number;
  actual: number;
}

export interface CreateBudgetCategoryRequest {
  category: string;
  items: CreateBudgetItemRequest[];
}

