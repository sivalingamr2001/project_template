import type { BudgetCategoryTotals, BudgetRecord, BudgetTotals } from "../types";

export function getCategoryTotals(
  record: BudgetRecord | null,
  categoryIndex: number,
): BudgetCategoryTotals {
  if (!record) {
    return { planned: 0, actual: 0, variance: 0, variancePercent: 0 };
  }

  const category = record.categories[categoryIndex];
  const planned = category.items.reduce((sum, item) => sum + item.planned, 0);
  const actual = category.items.reduce((sum, item) => sum + item.actual, 0);
  const variance = planned - actual;
  const variancePercent = planned > 0 ? (variance / planned) * 100 : 0;

  return { planned, actual, variance, variancePercent };
}

export function getBudgetTotals(record: BudgetRecord | null): BudgetTotals {
  if (!record) {
    return { totalPlanned: 0, totalActual: 0, variance: 0, variancePercent: 0 };
  }

  const totalPlanned = record.categories.reduce(
    (sum, category) => sum + category.items.reduce((itemSum, item) => itemSum + item.planned, 0),
    0,
  );
  const totalActual = record.categories.reduce(
    (sum, category) => sum + category.items.reduce((itemSum, item) => itemSum + item.actual, 0),
    0,
  );
  const variance = totalPlanned - totalActual;
  const variancePercent = totalPlanned > 0 ? (variance / totalPlanned) * 100 : 0;

  return { totalPlanned, totalActual, variance, variancePercent };
}

