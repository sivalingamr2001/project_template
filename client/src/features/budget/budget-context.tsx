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
  type CreateBudgetRequest,
  type UpdateBudgetRequest,
} from "@/features/budget/budgetApi";
import type { ApiError } from "@/shared/lib/axios";
import { useAuthContext } from "../auth";
import { useLoader } from "@/shared/hooks/useLoader";

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
  discardDraft: (recordId?: string) => void;
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

const DRAFT_STORAGE_VERSION = 1;
const DRAFT_STORAGE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

type BudgetDraftStoragePayload = {
  version: number;
  updatedAt: number;
  records: BudgetRecord[];
  activeRecordId: string | null;
};

function getBudgetDraftStorageKey(employeeId?: number) {
  return `draft:budget-records:${employeeId ?? "guest"}`;
}

function readBudgetDraftStorage(key: string): BudgetDraftStoragePayload | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as BudgetDraftStoragePayload;
    if (parsed.version !== DRAFT_STORAGE_VERSION) {
      return null;
    }

    if (Date.now() - parsed.updatedAt > DRAFT_STORAGE_TTL_MS) {
      return null;
    }

    if (!Array.isArray(parsed.records)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

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
  const { user } = useAuthContext();
  const { wrap } = useLoader();
  const employeeId: number | undefined = user?.employeeId;
  const draftStorageKey = useMemo(
    () => getBudgetDraftStorageKey(employeeId),
    [employeeId],
  );

  useEffect(() => {
    async function loadBudgets() {
      const storedDrafts = readBudgetDraftStorage(draftStorageKey);
      const draftRecords = storedDrafts?.records?.filter((record) =>
        record.id.startsWith("draft-"),
      );
      const storedActiveRecordId = storedDrafts?.activeRecordId ?? null;

      try {
        await wrap(async () => {
          const summaries = await getBudgetSummaries();

          const fullRecords = await Promise.all(
            summaries.map(async (summary: { budgetId: number }) => {
              const detail = await getBudgetById(summary.budgetId);
              return mapBudgetApiToUi(detail);
            }),
          );

          const mergedRecords = [
            ...(draftRecords ?? []),
            ...fullRecords.filter(
              (record) => !(draftRecords ?? []).some((draft) => draft.id === record.id),
            ),
          ];

          setState({
            activeRecordId:
              storedActiveRecordId &&
              mergedRecords.some((record) => record.id === storedActiveRecordId)
                ? storedActiveRecordId
                : null,
            records: mergedRecords,
          });
        });
      } catch (error) {
        console.error("Failed to load budgets", error);
        setState((current) => ({
          activeRecordId:
            storedActiveRecordId &&
            (draftRecords ?? []).some((record) => record.id === storedActiveRecordId)
              ? storedActiveRecordId
              : current.activeRecordId,
          records: draftRecords && draftRecords.length > 0 ? draftRecords : current.records,
        }));
      }
    }

    void loadBudgets();
  }, [draftStorageKey, wrap]);

  const draftRecords = useMemo(
    () => state.records.filter((record) => record.id.startsWith("draft-")),
    [state.records],
  );

  const activeDraftId = state.activeRecordId?.startsWith("draft-")
    ? state.activeRecordId
    : null;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (draftRecords.length === 0 && !activeDraftId) {
        window.localStorage.removeItem(draftStorageKey);
        return;
      }

      const payload: BudgetDraftStoragePayload = {
        version: DRAFT_STORAGE_VERSION,
        updatedAt: Date.now(),
        records: draftRecords,
        activeRecordId: activeDraftId,
      };

      window.localStorage.setItem(draftStorageKey, JSON.stringify(payload));
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [activeDraftId, draftRecords, draftStorageKey]);

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
      _saveAsDraft = true,
    ) => {
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
      setState((current) => ({
        activeRecordId:
          current.activeRecordId === recordId ? null : current.activeRecordId,
        records: current.records.filter((record) => record.id !== recordId),
      }));
      return;
    }

    try {
      await wrap(async () => {
        await deleteBudgetApi(budgetId);
      });

      setState((current) => ({
        activeRecordId:
          current.activeRecordId === recordId ? null : current.activeRecordId,
        records: current.records.filter((record) => record.id !== recordId),
      }));
    } catch (error) {
      const statusCode = (error as Partial<ApiError>).statusCode;
      if (statusCode === 404) {
        // Soft delete is idempotent. If it's already archived, ensure it's removed locally.
        setState((current) => ({
          activeRecordId:
            current.activeRecordId === recordId ? null : current.activeRecordId,
          records: current.records.filter((record) => record.id !== recordId),
        }));
        return;
      }

      console.error("Failed to archive budget record", error);
      throw error;
    }
  }, [wrap]);

  const loadRecord = useCallback((recordId: string | null) => {
    setState((current) => ({
      ...current,
      activeRecordId: recordId,
    }));
  }, []);

  const discardDraft = useCallback((recordId?: string) => {
    setState((current) => {
      const targetId = recordId ?? current.activeRecordId;
      if (!targetId || !targetId.startsWith("draft-")) {
        return current;
      }

      return {
        activeRecordId: current.activeRecordId === targetId ? null : current.activeRecordId,
        records: current.records.filter((record) => record.id !== targetId),
      };
    });
  }, []);

  const saveDraft = useCallback(async () => {
    if (!activeRecord) {
      return;
    }

    const budgetId = Number(activeRecord.id);
    const isDraft = Number.isNaN(budgetId);

    if (!employeeId) {
      throw new Error("Missing employee session.");
    }

    const createPayload: CreateBudgetRequest = {
      employeeId,
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

    const updateItems: UpdateBudgetRequest["items"] = activeRecord.budgetData
      .flatMap((category) => category.items)
      .filter((item) => typeof item.itemId === "number" && item.itemId > 0)
      .map((item) => ({
        itemId: item.itemId!,
        planned: item.planned,
        actual: item.actual,
      }));

    try {
      const response = await wrap(async () =>
        isDraft
          ? await createBudget(createPayload)
          : await updateBudget(budgetId, {
              projectCode: activeRecord.projectHeader.projectCode,
              productNo: activeRecord.projectHeader.productNo,
              projectTitle: activeRecord.projectHeader.productName,
              items: updateItems.length > 0 ? updateItems : [],
            }),
      );

      const record = mapBudgetApiToUi(response);
      setState((current) => ({
        activeRecordId: record.id,
        records: isDraft
          ? [record, ...current.records.filter((existing) => existing.id !== activeRecord.id)]
          : current.records.map((existing) =>
              existing.id === record.id ? record : existing,
            ),
      }));
    } catch (error) {
      console.error("Failed to save budget draft", error);
      throw error;
    }
  }, [activeRecord, employeeId]);

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
      discardDraft,
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
      discardDraft,
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
