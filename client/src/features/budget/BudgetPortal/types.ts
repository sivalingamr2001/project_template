export type ActiveView = "project-search" | "plan-entry" | "performance-report";

export type PlanTab = "budget-table" | "phase-timeline" | "documents";

export type BudgetStatus = "ON TRACK" | "AT RISK";

export interface BudgetRecordSummary {
  budgetId: number;
  projectCode: string;
  productNo: string;
  projectTitle: string;
  employeeId: number;
  modifiedOn: string;
}

export interface BudgetRecordHeader {
  budgetId: number;
  employeeId: number;
  projectCode: string;
  productNo: string;
  projectTitle: string;
  createdOn: string;
  modifiedOn: string;
}

export interface BudgetItem {
  itemId: number;
  itemName: string;
  planned: number;
  actual: number;
}

export interface BudgetCategory {
  categoryId: number;
  categoryName: string;
  items: BudgetItem[];
}

export interface BudgetRecord {
  header: BudgetRecordHeader;
  categories: BudgetCategory[];
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

export interface CreateBudgetInput {
  projectCode: string;
  productNo: string;
  productName: string;
}

export interface BudgetContextValue {
  activeBudget: BudgetRecord | null;
  activeView: ActiveView;
  budgetDraft: BudgetRecord | null;
  budgets: BudgetRecordSummary[];
  createBudget: (input: CreateBudgetInput) => Promise<void>;
  getBudgetTotals: (record?: BudgetRecord | null) => BudgetTotals;
  getCategoryTotals: (categoryIndex: number, record?: BudgetRecord | null) => BudgetCategoryTotals;
  isLoadingBudgets: boolean;
  isSaving: boolean;
  loadBudgetById: (budgetId: number) => void;
  saveBudgetDraft: () => Promise<void>;
  searchBudgets: (input: { projectCode?: string; productNo?: string }) => Promise<void>;
  setActiveView: (view: ActiveView) => void;
  setPlanTab: (tab: PlanTab) => void;
  planTab: PlanTab;
  updateBudgetItem: (params: {
    categoryIndex: number;
    itemIndex: number;
    field: "planned" | "actual";
    value: number;
  }) => void;
}

