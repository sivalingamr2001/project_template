import { createContext, useContext } from "react";

import type { BudgetContextValue } from "../types";

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetContextProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: BudgetContextValue;
}) {
  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget() {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("useBudget must be used within BudgetProvider.");
  }

  return context;
}

