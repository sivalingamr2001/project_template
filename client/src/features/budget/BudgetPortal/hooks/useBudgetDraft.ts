import { useCallback, useEffect, useState } from "react";

import type { BudgetRecord } from "../types";

function cloneRecord(record: BudgetRecord): BudgetRecord {
  return {
    header: { ...record.header },
    categories: record.categories.map((c) => ({
      ...c,
      items: c.items.map((i) => ({ ...i })),
    })),
  };
}

export function useBudgetDraft(activeBudget: BudgetRecord | null) {
  const [budgetDraft, setBudgetDraft] = useState<BudgetRecord | null>(null);

  useEffect(() => {
    setBudgetDraft(activeBudget ? cloneRecord(activeBudget) : null);
  }, [activeBudget]);

  const updateBudgetItem = useCallback(
    (params: { categoryIndex: number; itemIndex: number; field: "planned" | "actual"; value: number }) => {
      setBudgetDraft((current) => {
        if (!current) {
          return current;
        }

        const categories = current.categories.map((category, categoryIndex) => {
          if (categoryIndex !== params.categoryIndex) {
            return category;
          }

          const items = category.items.map((item, itemIndex) => {
            if (itemIndex !== params.itemIndex) {
              return item;
            }

            return { ...item, [params.field]: params.value };
          });

          return { ...category, items };
        });

        return { ...current, categories };
      });
    },
    [],
  );

  return { budgetDraft, setBudgetDraft, updateBudgetItem };
}

