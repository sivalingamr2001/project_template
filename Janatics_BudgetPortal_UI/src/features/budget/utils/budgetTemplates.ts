import { apiService } from "@/shared/lib/api-client"
import type { BudgetCategory } from "../types"

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

export type TemplateCategory = {
  category: string
  items: string[]
}

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

export const TEMPLATE_SESSION_KEY = "jan_budgetTemplate"

export function templateToBudgetData(
  categories: TemplateCategory[]
): BudgetCategory[] {
  return categories.map((category, categoryIndex) => ({
    categoryId: categoryIndex + 1,
    category: category.category,
    items: category.items.map((item, itemIndex) => ({
      itemId: itemIndex + 1,
      name: item,
      planned: 0,
      actual: 0,
    })),
  }))
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
      (sum, category) => sum + category.items.length,
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
