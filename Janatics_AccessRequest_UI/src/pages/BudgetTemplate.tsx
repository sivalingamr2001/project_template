import { useMemo, useState } from "react"
import type { ColDef } from "ag-grid-community"
import { useNavigate } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import DataGrid from "@/features/DynamicGrid/components/DataGrid/DataGrid"
import {
  getTemplateOptions,
  TEMPLATE_SESSION_KEY,
  type TemplateCategory,
} from "@/features/budget/utils/budgetTemplates"

type TemplateRow = {
  id: string
  name: string
  categoryCount: number
  itemCount: number
  preview: string
  source: "json" | "custom"
  template: TemplateCategory[]
}

export default function BudgetTemplate() {
  const navigate = useNavigate()

  const initialTemplates = useMemo<TemplateRow[]>(
    () =>
      getTemplateOptions().map((group) => ({
        id: group.id,
        name: group.name,
        categoryCount: group.categories.length,
        itemCount: group.categories.reduce(
          (sum, category) => sum + category.items.length,
          0
        ),
        preview: group.categories.map((category) => category.category).join(", "),
        source: "json" as const,
        template: group.categories,
      })),
    []
  )

  const [templates, setTemplates] = useState<TemplateRow[]>(initialTemplates)

  const handleUseTemplate = (template: TemplateCategory[]) => {
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
      { field: "name", headerName: "Template", flex: 1, minWidth: 220 },
      {
        field: "categoryCount",
        headerName: "Categories",
        flex: 0.5,
        minWidth: 140,
      },
      {
        field: "itemCount",
        headerName: "Items",
        flex: 0.5,
        minWidth: 120,
      },
      {
        field: "preview",
        headerName: "Category Preview",
        flex: 1.5,
        minWidth: 240,
        filter: false,
      },
      {
        headerName: "Actions",
        field: "actions" as never,
        minWidth: 130,
        maxWidth: 160,
        pinned: "right" as const,
        sortable: false,
        filter: false,
        cellRenderer: (params: { data: TemplateRow }) => (
          <Button
            size="sm"
            variant="outline"
            className="h-9 px-3 text-xs"
            onClick={() => handleUseTemplate(params.data.template)}
          >
            Use
          </Button>
        ),
      },
    ],
    []
  )

  return (
    <div className="space-y-6">
      <Card className="rounded-sm border border-border bg-card">
        <CardContent className="space-y-6 px-6 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <CardTitle>Budget Template</CardTitle>
              <p className="text-sm text-muted-foreground">
                Browse existing templates, or create a new template with the
                editor.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-background p-4">
            <DataGrid<TemplateRow>
              gridId="budget-template-grid"
              title="Template library"
              rowData={templates}
              columnDefs={columnDefs}
              pageSize={10}
              rowSelection="single"
              gridHeight="420px"
              showSearch={true}
              showRefreshButton={false}
              showClearFiltersButton={false}
              showExportCsvButton={false}
              showSelectedCount={true}
              toolbarRight={
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/budget-template/editor")}
                  >
                    New Template
                  </Button>
                </div>
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
