import { apiService } from "@/shared/lib/api-client"

// ─── API Wrapper Types ─────────────────────────────────────────
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

export interface TemplateResponse {
  templateId: number
  name: string
  structure: TemplateCategory[]
}

export type TemplateCategory = {
  category: string;
  items: string[];
};

export const TEMPLATE_SESSION_KEY = "jan_budgetTemplate"

// ─── Mapping Utility ───────────────────────────────────────────
// Converts Backend Response to Table Row
export const mapTemplateToRow = (t: TemplateResponse) => ({
  id: t.templateId,
  name: t.name,
  categoryCount: t.structure.length,
  itemCount: t.structure.reduce(
    (sum, cat) => sum + (cat.items?.length || 0),
    0
  ),
  preview: t.structure.map((cat) => cat.category).join(", "),
  template: t.structure, // Original JSON for SessionStorage
})

// ─── API Endpoints ─────────────────────────────────────────────
export const budgetTemplateApi = {
  /**
   * Fetch paged templates from Oracle DB
   */
  getAll: (page = 1, size = 10) =>
    apiService.get<ApiResult<PagedResult<TemplateResponse>>>(
      `/templates?pageNumber=${page}&pageSize=${size}`
    ),

  /**
   * Fetch a single template by ID
   */
  getById: (id: number) =>
    apiService.get<ApiResult<TemplateResponse>>(`/templates/${id}`),

  /**
   * Save a new budget structure
   */
  create: (name: string, structure: TemplateCategory[]) =>
    apiService.post<ApiResult<TemplateResponse>>("/templates", {
      name,
      structure,
    }),

  /**
   * Update an existing template in Oracle
   */
  update: (id: number, name: string, structure: TemplateCategory[]) =>
    apiService.put<ApiResult<boolean>>(`/templates/${id}`, {
      name,
      structure,
    }),

  /**
   * Permanently delete a template
   */
  delete: (id: number) =>
    apiService.delete<ApiResult<boolean>>(`/templates/${id}`),
}
