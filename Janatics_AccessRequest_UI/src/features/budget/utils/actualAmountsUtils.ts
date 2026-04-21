import type { ActualAmountItem, BudgetCategory } from "../types"

/**
 * Maps actual amounts to budget items by matching category and subcategory
 * Returns a Map where key is "category|subCategory" and value is the actual amount
 */
export function mapActualAmountsToBudget(
  actualAmounts: ActualAmountItem[],
  budgetCategories: BudgetCategory[]
): Map<string, number> {
  const map = new Map<string, number>()

  actualAmounts.forEach((actual) => {
    // Find matching budget category (case-insensitive)
    const matchedCategory = budgetCategories.find(
      (cat) =>
        cat.category.toLowerCase().trim() ===
        actual.category.toLowerCase().trim()
    )

    if (matchedCategory) {
      // Find matching budget item (by subcategory name)
      const matchedItem = matchedCategory.items.find(
        (item) =>
          item.name.toLowerCase().trim() ===
          actual.subCategory.toLowerCase().trim()
      )

      if (matchedItem) {
        // Create composite key for lookup
        const key = `${matchedCategory.category}|${matchedItem.name}`
        map.set(key, actual.amount)
      }
    }
  })

  return map
}

/**
 * Get actual amount for a specific budget item
 * @param category - Budget category name
 * @param itemName - Budget item name (subcategory in actual amounts)
 * @param amountMap - Map created by mapActualAmountsToBudget
 * @returns Actual amount or null if not found
 */
export function getActualAmountForItem(
  category: string,
  itemName: string,
  amountMap: Map<string, number>
): number | null {
  const key = `${category}|${itemName}`
  return amountMap.get(key) ?? null
}

/**
 * Validate that all budget items have corresponding actual amounts
 * @param actualAmounts - List of actual amounts from API
 * @param budgetCategories - Budget structure to validate against
 * @returns Object with validation results
 */
export function validateBudgetAgainstActuals(
  actualAmounts: ActualAmountItem[],
  budgetCategories: BudgetCategory[]
): {
  isValid: boolean
  missingItems: Array<{ category: string; item: string }>
  unmappedActuals: ActualAmountItem[]
} {
  const missingItems: Array<{ category: string; item: string }> = []
  const mappedActuals = new Set<string>()

  // Check for missing actual amounts
  budgetCategories.forEach((category) => {
    category.items.forEach((item) => {
      const hasActual = actualAmounts.some(
        (actual) =>
          actual.category.toLowerCase().trim() ===
            category.category.toLowerCase().trim() &&
          actual.subCategory.toLowerCase().trim() ===
            item.name.toLowerCase().trim()
      )

      if (!hasActual) {
        missingItems.push({
          category: category.category,
          item: item.name,
        })
      }
    })
  })

  // Track which actual amounts were mapped
  actualAmounts.forEach((actual) => {
    const budgetItem = budgetCategories.find(
      (cat) =>
        cat.category.toLowerCase().trim() ===
        actual.category.toLowerCase().trim()
    )

    if (
      budgetItem?.items.some(
        (item) =>
          item.name.toLowerCase().trim() ===
          actual.subCategory.toLowerCase().trim()
      )
    ) {
      mappedActuals.add(`${actual.category}|${actual.subCategory}`)
    }
  })

  // Find unmapped actual amounts
  const unmappedActuals = actualAmounts.filter(
    (actual) => !mappedActuals.has(`${actual.category}|${actual.subCategory}`)
  )

  return {
    isValid: missingItems.length === 0 && unmappedActuals.length === 0,
    missingItems,
    unmappedActuals,
  }
}
