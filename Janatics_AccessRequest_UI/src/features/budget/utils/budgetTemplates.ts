import planEntryTemplate from "@/data/planEntryTemplate.json"
import type { BudgetCategory } from "@/features/budget/types"

export type TemplateCategory = {
  category: string
  items: string[]
}

type RawTemplateCategory = TemplateCategory & {
  budgetId?: string
}

export type TemplateOption = {
  id: string
  name: string
  categories: TemplateCategory[]
}

export const TEMPLATE_SESSION_KEY = "budgetTemplate"

export function getTemplateOptions(): TemplateOption[] {
  const rawCategories = planEntryTemplate as RawTemplateCategory[]
  const grouped = rawCategories.reduce((map, entry) => {
    const budgetId = entry.budgetId ?? "default"

    if (!map.has(budgetId)) {
      map.set(budgetId, {
        id: budgetId,
        name:
          budgetId === "default"
            ? "Default Budget Template"
            : entry.budgetId ?? "Default Budget Template",
        categories: [] as TemplateCategory[],
      })
    }

    map.get(budgetId)?.categories.push({
      category: entry.category,
      items: entry.items,
    })

    return map
  }, new Map<string, TemplateOption>())

  return Array.from(grouped.values())
}

export function templateToBudgetData(
  categories: TemplateCategory[]
): BudgetCategory[] {
  return categories.map((category) => ({
    category: category.category,
    items: category.items.map((name) => ({
      name,
      planned: 0,
      actual: 0,
    })),
  }))
}
