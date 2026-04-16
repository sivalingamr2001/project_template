import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const defaultBudgetTemplate = [
  {
    category: "Product Design",
    items: [
      { name: "Benchmarking sample", planned: 0, actual: 0 },
      { name: "FEA Analysis", planned: 0, actual: 0 },
      { name: "CFD Analysis", planned: 0, actual: 0 },
      { name: "Design consultancy", planned: 0, actual: 0 },
      { name: "Others", planned: 0, actual: 0 },
    ],
  },
  {
    category: "Concept Development",
    items: [
      { name: "Comp.devpt-Concept", planned: 0, actual: 0 },
      { name: "Machining components", planned: 0, actual: 0 },
      { name: "Plastic - Hand moulds", planned: 0, actual: 0 },
      { name: "Rubber moulds", planned: 0, actual: 0 },
      { name: "3D printing", planned: 0, actual: 0 },
      { name: "RPT", planned: 0, actual: 0 },
      { name: "MIM", planned: 0, actual: 0 },
      { name: "Jigs & fixtures", planned: 0, actual: 0 },
      { name: "Concept testing", planned: 0, actual: 0 },
    ],
  },
  {
    category: "Prototype Development",
    items: [
      { name: "Machining components", planned: 0, actual: 0 },
      { name: "Plastic - Injection moulds", planned: 0, actual: 0 },
      { name: "Aluminium - Die casting", planned: 0, actual: 0 },
      { name: "Investment casting", planned: 0, actual: 0 },
      { name: "Stamping tools", planned: 0, actual: 0 },
      { name: "Rubber moulds", planned: 0, actual: 0 },
      { name: "Jigs & fixtures", planned: 0, actual: 0 },
      { name: "Comp. mfg.", planned: 0, actual: 0 },
      { name: "Testing", planned: 0, actual: 0 },
    ],
  },
  {
    category: "Product Testing",
    items: [
      { name: "Testing instruments", planned: 0, actual: 0 },
      { name: "Testing fixtures", planned: 0, actual: 0 },
      { name: "Certification", planned: 0, actual: 0 },
      { name: "Others", planned: 0, actual: 0 },
    ],
  },
  {
    category: "Capital Equipments",
    items: [
      { name: "Testing equipments", planned: 0, actual: 0 },
      { name: "Special machines", planned: 0, actual: 0 },
      { name: "Others", planned: 0, actual: 0 },
    ],
  },
  {
    category: "Field Validation",
    items: [{ name: "Product development", planned: 0, actual: 0 }],
  },
];

import type {
  BudgetCategory,
  BudgetCategoryTotals,
  BudgetItem,
  BudgetRecord,
  BudgetStoreState,
  BudgetTotals,
} from "@/features/budget/budget.types";
import {
  createBudget,
  deleteBudget as deleteBudgetApi,
  getBudgetById,
  getBudgetSummaries,
  mapBudgetApiToUi,
  updateBudget,
} from "@/features/budget/budgetApi";
import { useAuthContext } from "../auth";

interface BudgetContextValue {
  state: BudgetStoreState;
  activeRecord: BudgetRecord | null;
  createRecord: (
    input: {
      productName: string;
      productNo: string;
      projectCode: string;
    },
    saveAsDraft?: boolean,
  ) => Promise<BudgetRecord | null>;
  importRecord: (record: BudgetRecord) => void;
  deleteRecord: (recordId: string) => Promise<void>;
  getCategoryTotals: (
    categoryIndex: number,
    record?: BudgetRecord | null,
  ) => BudgetCategoryTotals;
  getRecordTotals: (record: BudgetRecord) => BudgetTotals;
  getTotals: (record?: BudgetRecord | null) => BudgetTotals;
  loadRecord: (recordId: string | null) => void;
  saveDraft: () => Promise<void>;
  updateBudgetItem: (
    categoryIndex: number,
    itemIndex: number,
    field: "planned" | "actual",
    value: number,
  ) => void;
}

const initialState: BudgetStoreState = {
  activeRecordId: null,
  records: [],
};

const BudgetContext = createContext<BudgetContextValue | null>(null);

function getCategoryTotalsForRecord(
  record: BudgetRecord | null,
  categoryIndex: number,
): BudgetCategoryTotals {
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
    (sum, category) =>
      sum + category.items.reduce((itemSum, item) => itemSum + item.planned, 0),
    0,
  );
  const totalActual = record.budgetData.reduce(
    (sum, category) =>
      sum + category.items.reduce((itemSum, item) => itemSum + item.actual, 0),
    0,
  );
  const variance = totalPlanned - totalActual;
  const variancePercent =
    totalPlanned > 0 ? (variance / totalPlanned) * 100 : 0;

  return { totalPlanned, totalActual, variance, variancePercent };
}

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BudgetStoreState>(initialState);

  useEffect(() => {
    async function loadBudgets() {
      try {
        const summaries = await getBudgetSummaries();

        const fullRecords = await Promise.all(
          summaries.map(async (summary) => {
            const detail = await getBudgetById(summary.budgetId);
            return mapBudgetApiToUi(detail);
          }),
        );

        setState({ activeRecordId: null, records: fullRecords });
      } catch (error) {
        console.error("Failed to load budgets", error);
      }
    }

    loadBudgets();
  }, []);

  const activeRecord =
    state.records.find((record) => record.id === state.activeRecordId) ?? null;

  function createDraftBudgetRecord(input: {
    productName: string;
    projectCode: string;
    productNo: string;
  }): BudgetRecord {
    return {
      id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      projectHeader: {
        productName: input.productName,
        projectCode: input.projectCode,
        productNo: input.productNo,
        phase: "Product development",
        department: "Research and Development",
        status: "ON TRACK",
        lastUpdated: new Date().toISOString(),
      },
      budgetData: defaultBudgetTemplate.map((category) => ({
        categoryId: undefined,
        category: category.category,
        items: category.items.map((item) => ({
          name: item.name,
          planned: item.planned,
          actual: item.actual,
        })),
      })),
    };
  }

  const createRecord = useCallback(
    async (
      {
        productName,
        productNo,
        projectCode,
      }: {
        productName: string;
        productNo: string;
        projectCode: string;
      },
      saveAsDraft = true,
    ) => {
      if (!saveAsDraft) {
        try {
          const created = await createBudget({
            employeeId: 1,
            projectCode,
            productNo,
            projectTitle: productName,
            budgetData: defaultBudgetTemplate.map((category) => ({
              category: category.category,
              items: category.items.map((item) => ({
                name: item.name,
                planned: item.planned,
                actual: item.actual,
              })),
            })),
          });

          const record = mapBudgetApiToUi(created);
          setState((current) => ({
            activeRecordId: record.id,
            records: [record, ...current.records],
          }));

          return record;
        } catch (error) {
          console.error("Failed to create and save budget record", error);
          return null;
        }
      }

      const record = createDraftBudgetRecord({
        productName,
        productNo,
        projectCode,
      });

      setState((current) => ({
        activeRecordId: record.id,
        records: [record, ...current.records],
      }));

      return record;
    },
    [],
  );

  const deleteRecord = useCallback(async (recordId: string) => {
    const budgetId = Number(recordId);
    if (Number.isNaN(budgetId)) {
      return;
    }

    try {
      await deleteBudgetApi(budgetId);
      setState((current) => ({
        activeRecordId:
          current.activeRecordId === recordId ? null : current.activeRecordId,
        records: current.records.filter((record) => record.id !== recordId),
      }));
    } catch (error) {
      console.error("Failed to delete budget record", error);
    }
  }, []);

  const loadRecord = useCallback((recordId: string | null) => {
    setState((current) => ({
      ...current,
      activeRecordId: recordId,
    }));
  }, []);

  const { user } = useAuthContext();
  const employeeId: number | undefined = user?.id;

  const saveDraft = useCallback(async () => {
    if (!activeRecord) {
      return;
    }

    const budgetId = Number(activeRecord.id);
    const createPayload: any = {
      employeeId: employeeId,
      projectCode: activeRecord.projectHeader.projectCode,
      productNo: activeRecord.projectHeader.productNo,
      projectTitle: activeRecord.projectHeader.productName,
      budgetData: activeRecord.budgetData.map((category) => ({
        category: category.category,
        items: category.items.map((item) => ({
          name: item.name,
          planned: item.planned,
          actual: item.actual,
        })),
      })),
    };

    const updateItems = activeRecord.budgetData.flatMap((category) =>
      category.items.map((item) => ({
        itemId: item.itemId ?? 0,
        planned: item.planned,
        actual: item.actual,
      })),
    );

    try {
      const response = Number.isNaN(budgetId)
        ? await createBudget(createPayload)
        : await updateBudget(budgetId, {
            projectCode: activeRecord.projectHeader.projectCode,
            productNo: activeRecord.projectHeader.productNo,
            projectTitle: activeRecord.projectHeader.productName,
            items: updateItems,
          });

      const record = mapBudgetApiToUi(response);
      setState((current) => ({
        activeRecordId: record.id,
        records: current.records.map((existing) =>
          existing.id === record.id ? record : existing,
        ),
      }));
    } catch (error) {
      console.error("Failed to save budget draft", error);
      throw error;
    }
  }, [activeRecord]);

  const importRecord = useCallback((record: BudgetRecord) => {
    setState((current) => ({
      activeRecordId: record.id,
      records: current.records.some((existing) => existing.id === record.id)
        ? current.records.map((existing) =>
            existing.id === record.id ? record : existing,
          )
        : [record, ...current.records],
    }));
  }, []);

  const updateBudgetItem = useCallback(
    (
      categoryIndex: number,
      itemIndex: number,
      field: "planned" | "actual",
      value: number,
    ) => {
      setState((current) => ({
        ...current,
        records: current.records.map((record) => {
          if (record.id !== current.activeRecordId) {
            return record;
          }

          return {
            ...record,
            budgetData: record.budgetData.map(
              (category, currentCategoryIndex) =>
                currentCategoryIndex !== categoryIndex
                  ? category
                  : {
                      ...category,
                      items: category.items.map((item, currentItemIndex) =>
                        currentItemIndex !== itemIndex
                          ? item
                          : { ...item, [field]: value },
                      ),
                    },
            ),
          };
        }),
      }));
    },
    [],
  );

  const value = useMemo<BudgetContextValue>(
    () => ({
      state,
      activeRecord,
      createRecord,
      importRecord,
      deleteRecord,
      getCategoryTotals: (categoryIndex, record = activeRecord) =>
        getCategoryTotalsForRecord(record, categoryIndex),
      getRecordTotals: (record) => getTotalsForRecord(record),
      getTotals: (record = activeRecord) => getTotalsForRecord(record),
      loadRecord,
      saveDraft,
      updateBudgetItem,
    }),
    [
      activeRecord,
      createRecord,
      deleteRecord,
      importRecord,
      loadRecord,
      saveDraft,
      state,
      updateBudgetItem,
    ],
  );

  return (
    <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("useBudget must be used within a BudgetProvider.");
  }

  return context;
}
