import { useMemo, useState } from "react";

import { useAuthContext } from "@/features/auth";

import { DUMMY_BUDGET } from "./data/dummy";
import { useBudgetsStore } from "./hooks/useBudgetsStore";
import { BudgetContextProvider } from "./hooks/useBudgetContext";
import type { ActiveView, BudgetContextValue, PlanTab } from "./types";
import { getCategoryTotals, getBudgetTotals } from "./utils/totals";

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthContext();
  const [activeView, setActiveView] = useState<ActiveView>("project-search");
  const [planTab, setPlanTab] = useState<PlanTab>("budget-table");
  const store = useBudgetsStore(auth.user?.id ?? 0);

  const value = useMemo<BudgetContextValue>(
    () => ({
      budgets: store.budgets,
      isLoadingBudgets: store.isLoadingBudgets,
      activeBudget: store.activeBudget ?? DUMMY_BUDGET,
      budgetDraft: store.budgetDraft ?? DUMMY_BUDGET,
      activeView,
      planTab,
      setPlanTab,
      setActiveView,
      isSaving: store.isSaving,
      loadBudgetById: store.loadBudgetById,
      searchBudgets: async (input) => { await store.searchBudgets(input); setActiveView("plan-entry"); },
      createBudget: async (input) => { await store.createBudget(input); setActiveView("plan-entry"); },
      saveBudgetDraft: store.saveBudgetDraft,
      updateBudgetItem: store.updateBudgetItem,
      getBudgetTotals: (record = store.budgetDraft) => getBudgetTotals(record ?? null),
      getCategoryTotals: (categoryIndex, record = store.budgetDraft) => getCategoryTotals(record ?? null, categoryIndex),
    }),
    [activeView, planTab, store, setActiveView],
  );

  return <BudgetContextProvider value={value}>{children}</BudgetContextProvider>;
}
