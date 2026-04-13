export interface BudgetItem {
  name: string;
  planned: number;
  actual: number;
}

export interface BudgetCategory {
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
