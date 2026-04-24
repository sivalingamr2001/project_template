import { useEffect, useMemo, useState, useCallback } from "react"
import type { ColDef } from "ag-grid-community"
import { useNavigate } from "react-router-dom"
import { Trash2, Edit3, CheckCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardTitle } from "@/shared/components/ui/card"
import DataGrid from "@/features/DynamicGrid/components/DataGrid/DataGrid"
import {
  budgetTemplateApi,
  type TemplateResponse,
  type TemplateCategory,
} from "@/features/budget/utils/budgetTemplates"

// ─── TYPES ──────────────────────────────────────────────────────────────────

type TemplateRow = {
  id: number
  name: string
  categoryCount: number
  itemCount: number
  preview: string
  template: TemplateCategory[]
}

const TEMPLATE_SESSION_KEY = "budgetTemplate"

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function BudgetTemplate() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<TemplateRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 1. Fetch & Map Data (READ)
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await budgetTemplateApi.getAll(1, 100)

      if (response.data.success) {
        // Only mapping data received from the Oracle API
        const mappedRows: TemplateRow[] = response.data.data.data.map(
          (t: TemplateResponse) => ({
            id: t.templateId,
            name: t.name,
            categoryCount: t.structure.length,
            itemCount: t.structure.reduce(
              (sum, cat) => sum + (cat.items?.length || 0),
              0
            ),
            preview: t.structure.map((cat) => cat.category).join(", "),
            template: t.structure,
          })
        )
        setTemplates(mappedRows)
      } else {
        toast.error(response.data.message || "Failed to load templates")
      }
    } catch (error) {
      console.error("API Error:", error)
      toast.error("Network error while fetching templates")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // 2. Delete Action (DELETE)
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this template from Oracle DB?")) return

    try {
      const response = await budgetTemplateApi.delete(id)
      if (response.data.success) {
        toast.success("Template deleted")
        fetchTemplates()
      } else {
        toast.error(response.data.message || "Delete failed")
      }
    } catch (error) {
      toast.error("Error connecting to server")
    }
  }

  // 3. Use Template Action (Session for Plan Entry)
  const handleUseTemplate = (template: TemplateCategory[]) => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        TEMPLATE_SESSION_KEY,
        JSON.stringify(template)
      )
    }
    navigate("/plan-entry")
  }

  // 4. Column Definitions
  const columnDefs = useMemo<ColDef<TemplateRow>[]>(
    () => [
      { field: "name", headerName: "Template", flex: 1, minWidth: 200 },
      { field: "categoryCount", headerName: "Categories", width: 120 },
      { field: "itemCount", headerName: "Items", width: 100 },
      {
        field: "preview",
        headerName: "Category Preview",
        flex: 1.5,
        minWidth: 250,
        filter: false,
        cellStyle: { color: "#6b7280", fontSize: "12px" },
      },
      {
        headerName: "Actions",
        width: 150,
        pinned: "right",
        sortable: false,
        filter: false,
        cellRenderer: (params: { data: TemplateRow }) => (
          <div className="flex h-full items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-blue-600"
              onClick={() =>
                navigate(`/budget-template/editor/${params.data.id}`)
              }
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDelete(params.data.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [navigate]
  )

  return (
    <div className="space-y-2">
      <Card className="rounded-sm border border-border shadow-sm">
        <CardContent className="space-y-6 px-6 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">
                Budget Templates
              </CardTitle>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/budget-template/editor")}
            >
              + Create Template
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-background p-2">
            <DataGrid<TemplateRow>
              gridId="budget-template-grid"
              rowData={templates}
              columnDefs={columnDefs}
              showSearch={true}
              showRefreshButton={false}
              showClearFiltersButton={false}
              showExportCsvButton={false}
              loading={isLoading}
              pageSize={10}
              gridHeight="500px"
              onRefresh={fetchTemplates}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
