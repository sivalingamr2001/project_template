import { useMemo, useState } from "react"
import type { ColDef } from "ag-grid-community"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DataGrid from "@/components/DynamicGrid/components/DataGrid/DataGrid"
import { TemplateEditor } from "@/components/TemplateEditor"
import planEntryTemplate from "@/data/planEntryTemplate.json"

type TemplateCategory = {
  category: string
  items: string[]
}

type RawTemplateCategory = TemplateCategory & {
  budgetId?: string
}

type TemplateRow = {
  id: string
  name: string
  categoryCount: number
  itemCount: number
  preview: string
  source: "json" | "custom"
  template: TemplateCategory[]
}

type SavedTemplatePayload = {
  name: string
  categories: TemplateCategory[]
}

export default function BudgetTemplate() {
  const navigate = useNavigate()
  const initialTemplates = useMemo(() => {
    const rawCategories = planEntryTemplate as RawTemplateCategory[]
    const grouped = rawCategories.reduce((map, entry) => {
      const budgetId = entry.budgetId ?? "TEMPLATE_DEFAULT"
      if (!map.has(budgetId)) {
        map.set(budgetId, {
          id: budgetId,
          name:
            budgetId === "TEMPLATE_DEFAULT"
              ? "Default Budget Template"
              : budgetId,
          categories: [] as TemplateCategory[],
        })
      }
      map.get(budgetId)!.categories.push({
        category: entry.category,
        items: entry.items,
      })
      return map
    }, new Map<string, { id: string; name: string; categories: TemplateCategory[] }>())

    return Array.from(grouped.values()).map((group) => ({
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
    }))
  }, [])

  const [templates, setTemplates] = useState<TemplateRow[]>(initialTemplates)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

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
        field: "actions" as any,
        minWidth: 130,
        maxWidth: 160,
        pinned: "right" as const,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => (
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

  const handleUseTemplate = (template: TemplateCategory[] | TemplateCategory) => {
    const categories = Array.isArray(template) ? template : [template]
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("budgetTemplate", JSON.stringify(categories))
    }
    navigate("/plan-entry")
  }

  const handleSaveTemplate = (payload: SavedTemplatePayload) => {
    setTemplates((current) => [
      ...current,
      {
        id: `custom-${Date.now()}`,
        name: payload.name,
        categoryCount: payload.categories.length,
        itemCount: payload.categories.reduce((sum, category) => sum + category.items.length, 0),
        preview: payload.categories.map((category) => category.category).join(", "),
        source: "custom",
        template: payload.categories,
      },
    ])
    setIsEditorOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border border-border bg-card">
        <CardHeader className="p-6">
          <CardTitle>Budget Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Browse existing templates, or create a new template with the editor.
              </p>
            </div>
            <Button onClick={() => setIsEditorOpen(true)}>Create Template</Button>
          </div>

          <TemplateEditor
            isOpen={isEditorOpen}
            onClose={() => setIsEditorOpen(false)}
            onSave={handleSaveTemplate}
          />

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
              showClearFiltersButton={true}
              showExportCsvButton={false}
              showSelectedCount={true}
              toolbarRight={
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setIsEditorOpen(true)}>
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
