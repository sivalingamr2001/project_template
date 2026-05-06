import { apiService } from "@/shared/lib/api-client"
import type {
  BudgetCategory,
  BudgetItem,
  BudgetTemplateCategory,
} from "../types"

export interface ApiResult<T> {
  success: boolean
  message: string | null
  data: T
  errors: string[] | null
}

export interface PagedResult<T> {
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  data: T[]
}

export type TemplateCategory = BudgetTemplateCategory

export interface TemplateResponse {
  templateId: number
  name: string
  structure: TemplateCategory[]
}

export type TemplateOption = {
  id: string
  templateId: number
  name: string
  categories: TemplateCategory[]
}

export type TemplateRow = {
  id: number
  name: string
  categoryCount: number
  itemCount: number
  preview: string
  template: TemplateCategory[]
}

export function templateToBudgetData(
  categories: TemplateCategory[]
): BudgetCategory[] {
  return categories.map((category, categoryIndex) => ({
    categoryId: categoryIndex + 1,
    category: category.category,
    items: flattenTemplateCategoryItems(category).map((item, itemIndex) => ({
      ...item,
      itemId: itemIndex + 1,
      planned: 0,
      actual: 0,
    })),
  }))
}

export function flattenTemplateCategoryItems(
  category: TemplateCategory
): Omit<BudgetItem, "planned" | "actual">[] {
  const directItems = category.items.map((item) => ({
    name: item.name,
  }))

  const subCategoryItems = (category.subCategories ?? []).flatMap(
    (subCategory) => [
      {
        name: subCategory.name,
        isCalculated: true as const,
        calculationType: "multiply" as const,
        operandNames: subCategory.items.map((item) => item.name),
        subCategory: subCategory.name,
      },
      ...subCategory.items.map((item) => ({
        name: item.name,
        excludeFromTotals: true,
        subCategory: subCategory.name,
        isSubItem: true,
      })),
    ]
  )

  return [...directItems, ...subCategoryItems]
}

export function applyTemplateMetadataToBudgetData(
  rawCategories: BudgetCategory[],
  templateCategories?: TemplateCategory[]
): BudgetCategory[] {
  if (!templateCategories || templateCategories.length === 0) {
    return rawCategories
  }

  const rawCategoryLookup = new Map(
    rawCategories.map((category) => [
      category.category.trim().toLowerCase(),
      category,
    ])
  )

  return templateCategories.map((templateCategory, categoryIndex) => {
    const rawCategory = rawCategoryLookup.get(
      templateCategory.category.trim().toLowerCase()
    )

    if (!rawCategory) {
      return {
        categoryId: categoryIndex + 1,
        category: templateCategory.category,
        items: recalculateCategoryItems(
          flattenTemplateCategoryItems(templateCategory).map(
            (item, itemIndex) => ({
              ...item,
              itemId: itemIndex + 1,
              planned: 0,
              actual: 0,
            })
          )
        ),
      }
    }

    const rawItemLookup = new Map(
      rawCategory.items.map((item) => [item.name.trim().toLowerCase(), item])
    )

    const templatedItems = flattenTemplateCategoryItems(templateCategory).map(
      (item, itemIndex) => {
        const rawItem = rawItemLookup.get(item.name.trim().toLowerCase())
        return {
          ...item,
          itemId: rawItem?.itemId ?? itemIndex + 1,
          planned: rawItem?.planned ?? 0,
          actual: rawItem?.actual ?? 0,
        }
      }
    )

    const templatedKeys = new Set(
      templatedItems.map((item) => item.name.trim().toLowerCase())
    )

    const fallbackItems = rawCategory.items.filter(
      (item) => !templatedKeys.has(item.name.trim().toLowerCase())
    )

    return {
      categoryId: rawCategory.categoryId,
      category: rawCategory.category,
      items: recalculateCategoryItems([...templatedItems, ...fallbackItems]),
    }
  })
}

export function recalculateCategoryItems(items: BudgetItem[]): BudgetItem[] {
  return items.map((item) => {
    if (!item.isCalculated || item.calculationType !== "multiply") {
      return item
    }

    const operands = item.operandNames ?? []
    const sourceItems = operands
      .map((operandName) =>
        items.find(
          (candidate) =>
            candidate.name.trim().toLowerCase() ===
            operandName.trim().toLowerCase()
        )
      )
      .filter((candidate): candidate is BudgetItem => Boolean(candidate))

    const planned =
      sourceItems.length === 0
        ? 0
        : sourceItems.reduce(
            (product, sourceItem) => product * sourceItem.planned,
            1
          )

    const actual =
      sourceItems.length === 0
        ? 0
        : sourceItems.reduce(
            (product, sourceItem) => product * sourceItem.actual,
            1
          )

    return {
      ...item,
      planned,
      actual,
    }
  })
}

export function mapTemplateToOption(
  template: TemplateResponse
): TemplateOption {
  return {
    id: template.templateId.toString(),
    templateId: template.templateId,
    name: template.name,
    categories: template.structure,
  }
}

export function mapTemplateToRow(template: TemplateResponse): TemplateRow {
  return {
    id: template.templateId,
    name: template.name,
    categoryCount: template.structure.length,
    itemCount: template.structure.reduce(
      (sum, category) =>
        sum +
        category.items.length +
        (category.subCategories ?? []).reduce(
          (subTotal, subCategory) => subTotal + 1 + subCategory.items.length,
          0
        ),
      0
    ),
    preview: template.structure.map((category) => category.category).join(", "),
    template: template.structure,
  }
}

export const budgetTemplateApi = {
  getAll: (page = 1, size = 10) =>
    apiService.get<ApiResult<PagedResult<TemplateResponse>>>(
      `/templates?pageNumber=${page}&pageSize=${size}`
    ),

  getById: (id: number) =>
    apiService.get<ApiResult<TemplateResponse>>(`/templates/${id}`),

  create: (name: string, structure: TemplateCategory[]) =>
    apiService.post<ApiResult<TemplateResponse>>("/templates", {
      name,
      structure,
    }),

  update: (id: number, name: string, structure: TemplateCategory[]) =>
    apiService.put<ApiResult<TemplateResponse>>(`/templates/${id}`, {
      name,
      structure,
    }),

  delete: (id: number) =>
    apiService.delete<ApiResult<boolean>>(`/templates/${id}`),
} as const
