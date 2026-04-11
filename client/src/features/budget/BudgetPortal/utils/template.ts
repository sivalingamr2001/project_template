import budgetTemplateData from "../data/budget-template.json";
import type { CreateBudgetCategoryRequest } from "./types.private";

interface BudgetTemplateCategory {
  category: string;
  items: string[];
}

const template = budgetTemplateData as BudgetTemplateCategory[];

export function buildBudgetDataFromTemplate(): CreateBudgetCategoryRequest[] {
  return template.map((category) => ({
    category: category.category,
    items: category.items.map((name) => ({ name, planned: 0, actual: 0 })),
  }));
}
