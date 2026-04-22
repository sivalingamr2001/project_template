import { BudgetTable } from "@/components/plan-entry/BudgetTable"
import { ProjectHeader } from "@/components/plan-entry/ProjectHeader"
import type { BudgetRecord } from "@/components/plan-entry/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import planEntryTemplate from "@/data/planEntryTemplate.json"

type TemplateCategory = {
  category: string
  items: string[]
}

type RawTemplateCategory = TemplateCategory & {
  budgetId?: string
}

type TemplateOption = {
  id: string
  name: string
  categories: TemplateCategory[]
}

const initialHeader = {
  projectCode: "",
  productNo: "",
  productName: "New Budget Plan",
  lastUpdated: new Date().toISOString(),
}

function createBudgetRecord(
  templateCategories: TemplateCategory[] | null,
  name = "New Budget Plan"
): BudgetRecord {
  return {
    id: `budget-plan-${Date.now()}`,
    projectHeader: {
      ...initialHeader,
      productName: name,
    },
    budgetData: templateCategories
      ? templateCategories.map((category) => ({
          category: category.category,
          items: category.items.map((name) => ({
            name,
            planned: 0,
            actual: 0,
          })),
        }))
      : [],
  }
}

function PlanEntry() {
  const templateOptions = useMemo<TemplateOption[]>(() => {
    const rawCategories = planEntryTemplate as RawTemplateCategory[]
    const grouped = rawCategories.reduce(
      (map, entry) => {
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
        map.get(budgetId)!.categories.push({
          category: entry.category,
          items: entry.items,
        })
        return map
      },
      new Map<string, TemplateOption>()
    )

    return Array.from(grouped.values())
  }, [])

  const [selectedTemplateId, setSelectedTemplateId] = useState(
    () => templateOptions[0]?.id ?? ""
  )

  const selectedTemplate = useMemo(
    () =>
      templateOptions.find((template) => template.id === selectedTemplateId) ??
      templateOptions[0] ??
      null,
    [templateOptions, selectedTemplateId]
  )

  const [budgetRecord, setBudgetRecord] = useState<BudgetRecord>(() =>
    createBudgetRecord(selectedTemplate?.categories ?? null, selectedTemplate?.name)
  )

  const loadTemplateFromSession = useMemo(() => {
    if (typeof window === "undefined") return null
    const stored = window.sessionStorage.getItem("budgetTemplate")
    if (!stored) return null

    try {
      return JSON.parse(stored) as TemplateCategory[]
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    if (loadTemplateFromSession) {
      setBudgetRecord(
        createBudgetRecord(loadTemplateFromSession, "Selected Budget Template")
      )
      window.sessionStorage.removeItem("budgetTemplate")
      toast.success("Loaded budget template into plan entry.")
    }
  }, [loadTemplateFromSession])

  const handleTemplateChange = (value: string) => {
    setSelectedTemplateId(value)
    const option = templateOptions.find((template) => template.id === value)
    if (option) {
      setBudgetRecord(createBudgetRecord(option.categories, option.name))
    }
  }

  const handleSaveRecord = async () => {
    toast.success("Budget record saved. Draft is preserved in this session.")
  }

  const handleDiscardDraft = () => {
    setBudgetRecord(createBudgetRecord(null))
    toast.success("Draft changes discarded.")
  }

  const handleExportCsv = () => {
    if (!budgetRecord) {
      return
    }

    const csvRows = [
      [
        "Category",
        "Cost Item",
        "Planned (INR)",
        "Actual (INR)",
        "Variance",
        "Var %",
      ],
      ...budgetRecord.budgetData.flatMap((category) =>
        category.items.map((item) => {
          const variance = item.planned - item.actual
          const variancePercent =
            item.planned > 0 ? (variance / item.planned) * 100 : 0
          return [
            category.category,
            item.name,
            item.planned.toString(),
            item.actual.toString(),
            variance.toString(),
            `${variancePercent.toFixed(1)}%`,
          ]
        })
      ),
    ]

    const csvContent = csvRows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${budgetRecord.projectHeader.projectCode || "new-budget-plan"}-plan-entry.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <ProjectHeader
        record={budgetRecord}
        onSaveRecord={handleSaveRecord}
        onDiscardDraft={handleDiscardDraft}
        onExportCsv={handleExportCsv}
        selectedTemplateId={selectedTemplateId}
        onTemplateChange={handleTemplateChange}
        templateOptions={templateOptions}
      />
      <BudgetTable record={budgetRecord} onRecordChange={setBudgetRecord} />
    </div>
  )
}

export default PlanEntry
