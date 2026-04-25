import { useCallback, useEffect, useMemo, useState } from "react"
import type { ColDef } from "ag-grid-community"
import { useNavigate } from "react-router-dom"
import { CheckCircle, Edit3, Trash2 } from "lucide-react"
import { toast } from "sonner"

import DataGrid from "@/features/DynamicGrid/components/DataGrid/DataGrid"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardTitle } from "@/shared/components/ui/card"
import {
  budgetTemplateApi,
  mapTemplateToRow,
  TEMPLATE_SESSION_KEY,
  type TemplateRow,
} from "@/features/budget/utils/budgetTemplates"

export default function BudgetTemplate() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<TemplateRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await budgetTemplateApi.getAll(1, 100)

      if (response.data.success) {
        setTemplates(response.data.data.data.map(mapTemplateToRow))
      } else {
        toast.error(response.data.message || "Failed to load templates")
      }
    } catch (error) {
      toast.error("Network error while fetching templates")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchTemplates()
  }, [fetchTemplates])

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this template?")) {
      return
    }

    try {
      const response = await budgetTemplateApi.delete(id)

      if (response.data.success) {
        toast.success("Template deleted")
        void fetchTemplates()
      } else {
        toast.error(response.data.message || "Delete failed")
      }
    } catch (error) {
      toast.error("Error connecting to server")
    }
  }

  const handleUseTemplate = (template: TemplateRow["template"]) => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        TEMPLATE_SESSION_KEY,
        JSON.stringify(template)
      )
    }

    navigate("/plan-entry")
  }

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
        width: 180,
        pinned: "right",
        sortable: false,
        filter: false,
        cellRenderer: (params: { data: TemplateRow }) => (
          <div className="flex h-full items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-emerald-600"
              onClick={() => handleUseTemplate(params.data.template)}
              title="Use template"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-blue-600"
              onClick={() =>
                navigate(`/budget-template/editor/${params.data.id}`)
              }
              title="Edit template"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDelete(params.data.id)}
              title="Delete template"
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
