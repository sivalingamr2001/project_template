import { createContext, useContext, useMemo, useState } from "react";

import budgetRecordsData from "@/features/budget/data/budget-records.json";
import budgetTemplateData from "@/features/budget/data/budget-template.json";
import type {
  BudgetCategory,
  BudgetCategoryTotals,
  BudgetRecord,
  BudgetStoreState,
  BudgetTemplateCategory,
  BudgetTotals,
} from "@/features/budget/budget.types";

interface BudgetContextValue {
  state: BudgetStoreState;
  activeRecord: BudgetRecord | null;
  createRecord: (input: { productNo: string; projectCode: string }) => BudgetRecord;
  deleteRecord: (recordId: string) => void;
  getCategoryTotals: (categoryIndex: number, record?: BudgetRecord | null) => BudgetCategoryTotals;
  getRecordTotals: (record: BudgetRecord) => BudgetTotals;
  getTotals: (record?: BudgetRecord | null) => BudgetTotals;
  loadRecord: (recordId: string) => void;
  saveDraft: () => void;
  updateBudgetItem: (
    categoryIndex: number,
    itemIndex: number,
    field: "planned" | "actual",
    value: number,
  ) => void;
}

const budgetTemplate = budgetTemplateData as BudgetTemplateCategory[];
const initialRecords = budgetRecordsData as BudgetRecord[];

const BudgetContext = createContext<BudgetContextValue | null>(null);

function cloneBudgetData(data: BudgetCategory[]) {
  return data.map((category) => ({
    ...category,
    items: category.items.map((item) => ({ ...item })),
  }));
}

function buildBudgetDataFromTemplate() {
  return budgetTemplate.map((category) => ({
    category: category.category,
    items: category.items.map((item) => ({
      name: item,
      planned: 0,
      actual: 0,
    })),
  }));
}

function getCategoryTotalsForRecord(record: BudgetRecord | null, categoryIndex: number): BudgetCategoryTotals {
  if (!record) {
    return { planned: 0, actual: 0, variance: 0, variancePercent: 0 };
  }

  const category = record.budgetData[categoryIndex];
  const planned = category.items.reduce((sum, item) => sum + item.planned, 0);
  const actual = category.items.reduce((sum, item) => sum + item.actual, 0);
  const variance = planned - actual;
  const variancePercent = planned > 0 ? (variance / planned) * 100 : 0;

  return { planned, actual, variance, variancePercent };
}

function getTotalsForRecord(record: BudgetRecord | null): BudgetTotals {
  if (!record) {
    return { totalPlanned: 0, totalActual: 0, variance: 0, variancePercent: 0 };
  }

  const totalPlanned = record.budgetData.reduce(
    (sum, category) => sum + category.items.reduce((itemSum, item) => itemSum + item.planned, 0),
    0,
  );
  const totalActual = record.budgetData.reduce(
    (sum, category) => sum + category.items.reduce((itemSum, item) => itemSum + item.actual, 0),
    0,
  );
  const variance = totalPlanned - totalActual;
  const variancePercent = totalPlanned > 0 ? (variance / totalPlanned) * 100 : 0;

  return { totalPlanned, totalActual, variance, variancePercent };
}

function createRecordId(projectCode: string) {
  return `${projectCode.toLowerCase()}-${Date.now()}`;
}

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BudgetStoreState>({
    activeRecordId: null,
    records: initialRecords.map((record) => ({
      ...record,
      budgetData: cloneBudgetData(record.budgetData),
    })),
  });

  const activeRecord =
    state.records.find((record) => record.id === state.activeRecordId) ?? null;

  const value = useMemo<BudgetContextValue>(
    () => ({
      state,
      activeRecord,
      createRecord: ({ productNo, projectCode }) => {
        const nextRecord: BudgetRecord = {
          id: createRecordId(projectCode),
          projectHeader: {
            productName: `${productNo} New Product Budget`,
            projectCode,
            productNo,
            phase: "Product development",
            department: "Research and Development",
            status: "ON TRACK",
            lastUpdated: new Date().toISOString(),
          },
          budgetData: buildBudgetDataFromTemplate(),
        };

        setState((current) => ({
          activeRecordId: nextRecord.id,
          records: [nextRecord, ...current.records],
        }));

        return nextRecord;
      },
      deleteRecord: (recordId) => {
        setState((current) => ({
          activeRecordId: current.activeRecordId === recordId ? null : current.activeRecordId,
          records: current.records.filter((record) => record.id !== recordId),
        }));
      },
      getCategoryTotals: (categoryIndex, record = activeRecord) =>
        getCategoryTotalsForRecord(record, categoryIndex),
      getRecordTotals: (record) => getTotalsForRecord(record),
      getTotals: (record = activeRecord) => getTotalsForRecord(record),
      loadRecord: (recordId) => {
        setState((current) => ({
          ...current,
          activeRecordId: recordId,
        }));
      },
      saveDraft: () => {
        setState((current) => ({
          ...current,
          records: current.records.map((record) => {
            if (record.id !== current.activeRecordId) {
              return record;
            }

            const totals = getTotalsForRecord(record);

            return {
              ...record,
              projectHeader: {
                ...record.projectHeader,
                lastUpdated: new Date().toISOString(),
                status: totals.variance < 0 ? "AT RISK" : "ON TRACK",
              },
            };
          }),
        }));
      },
      updateBudgetItem: (categoryIndex, itemIndex, field, value) => {
        setState((current) => ({
          ...current,
          records: current.records.map((record) => {
            if (record.id !== current.activeRecordId) {
              return record;
            }

            return {
              ...record,
              budgetData: record.budgetData.map((category, currentCategoryIndex) =>
                currentCategoryIndex !== categoryIndex
                  ? category
                  : {
                      ...category,
                      items: category.items.map((item, currentItemIndex) =>
                        currentItemIndex !== itemIndex ? item : { ...item, [field]: value },
                      ),
                    },
              ),
            };
          }),
        }));
      },
    }),
    [activeRecord, state],
  );

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget() {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("useBudget must be used within a BudgetProvider.");
  }

  return context;
}
