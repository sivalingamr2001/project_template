import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/shared/components/ui/button"
import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import type { BudgetRecord } from "../types"
import { useBudget } from "@/providers/Budget/BudgetProvider"
import { useNavigationBlock } from "@/providers/NavigationBlockProvider"
import { toast } from "sonner"
import { ProjectHeader } from "../components/plan-entry/ProjectHeader"
import { BudgetValidationAlert } from "../components/BudgetValidationAlert"
import { BudgetTable } from "../components/plan-entry/BudgetTable"
import { DraftConfirmationDialog } from "../components/DraftConfirmationDialog"

const DRAFT_KEY_PREFIX = "budget-plan-entry-draft"

const DEFAULT_CATEGORIES = [
  {
    category: "Personnel",
    items: [
      { name: "Labor cost", planned: 0, actual: 0 },
      { name: "Consulting fees", planned: 0, actual: 0 },
    ],
  },
  {
    category: "Materials",
    items: [
      { name: "Consumables", planned: 0, actual: 0 },
      { name: "Prototype parts", planned: 0, actual: 0 },
    ],
  },
  {
    category: "Equipment",
    items: [
      { name: "Machinery", planned: 0, actual: 0 },
      { name: "Test instruments", planned: 0, actual: 0 },
    ],
  },
]

function createLocalBudgetRecord(input: {
  productName: string
  projectCode: string
  productNo: string
}): BudgetRecord {
  return {
    id: `draft-${Date.now()}`,
    projectHeader: {
      productName: input.productName,
      projectCode: input.projectCode,
      productNo: input.productNo,
      phase: "Product development",
      department: "Research and Development",
      status: "ON TRACK",
      lastUpdated: new Date().toISOString(),
    },
    budgetData: DEFAULT_CATEGORIES,
  }
}

export default function PlanEntry() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setActiveRecord, createBudgetRecord, updateBudgetRecord, loading, error } = useBudget()
  const { onBlock, onUnblock } = useNavigationBlock()
  const [localRecord, setLocalRecord] = useState<BudgetRecord | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)

  const draftKey = useMemo(
    () => `${DRAFT_KEY_PREFIX}:${user?.employeeId ?? "guest"}`,
    [user?.employeeId]
  )

  useEffect(() => {
    const state = location.state as
      | {
          fromDashboard?: boolean
          inputData?: {
            productName: string
            projectCode: string
            productNo: string
          }
          draftRecord?: BudgetRecord
        }
      | null

    if (state?.draftRecord) {
      setLocalRecord(state.draftRecord)
      setActiveRecord(state.draftRecord)
      return
    }

    if (state?.inputData) {
      const newRecord = createLocalBudgetRecord(state.inputData)
      setLocalRecord(newRecord)
      setActiveRecord(newRecord)
      return
    }

    const rawDraft = window.localStorage.getItem(draftKey)
    if (!rawDraft) {
      return
    }

    try {
      const parsed = JSON.parse(rawDraft) as BudgetRecord
      if (parsed?.id && parsed.projectHeader?.projectCode) {
        setLocalRecord(parsed)
        setActiveRecord(parsed)
      }
    } catch {
      window.localStorage.removeItem(draftKey)
    }
  }, [draftKey, location.state, createBudgetRecord, setActiveRecord])

  useEffect(() => {
    if (!localRecord) {
      return
    }
    window.localStorage.setItem(draftKey, JSON.stringify(localRecord))
  }, [localRecord, draftKey])

  // Handle browser back button and beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        setShowConfirmationDialog(true)
        setPendingNavigation('back')
        // Push the current state back to prevent navigation
        window.history.pushState(null, '', window.location.pathname)
      }
    }

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload)
      window.addEventListener('popstate', handlePopState)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [hasUnsavedChanges])

  // Update navigation block when unsaved changes change
  useEffect(() => {
    if (hasUnsavedChanges && localRecord) {
      onBlock(`You have unsaved changes for ${localRecord.projectHeader.productName} (${localRecord.projectHeader.projectCode}). Would you like to save as draft or clear?`, localRecord)
    } else {
      onUnblock()
    }
  }, [hasUnsavedChanges, localRecord, onBlock, onUnblock])

  const saveDraft = async () => {
    if (!localRecord) {
      return
    }
    window.localStorage.setItem(draftKey, JSON.stringify(localRecord))
    toast.success("Draft saved successfully")
  }

  const saveRecord = async () => {
    if (!localRecord) {
      return
    }

    try {
      if (localRecord.id.startsWith('draft-')) {
        // Create new record
        await createBudgetRecord(localRecord)
        toast.success("Budget record created successfully")
      } else {
        // Update existing record
        await updateBudgetRecord(localRecord.id, localRecord)
        toast.success("Budget record updated successfully")
      }
      window.localStorage.removeItem(draftKey)
      navigate("/budget/dashboard")
    } catch (err) {
      toast.error("Failed to save budget record")
    }
  }

  const discardDraft = () => {
    window.localStorage.removeItem(draftKey)
    setLocalRecord(null)
    setActiveRecord(null)
    navigate("/budget/dashboard")
  }

  const exportCsv = () => {
    if (!localRecord) {
      return
    }

    const rows: string[] = [
      "Category,Cost Item,Planned (INR),Actual (INR),Variance (INR),Variance (%)",
    ]

    localRecord.budgetData.forEach((category) => {
      category.items.forEach((item) => {
        const variance = item.planned - item.actual
        const variancePercent = item.planned > 0 ? (variance / item.planned) * 100 : 0
        rows.push(
          [
            category.category,
            item.name,
            item.planned,
            item.actual,
            variance,
            variancePercent.toFixed(1),
          ]
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(",")
        )
      })
    })

    const blob = new Blob([rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${localRecord.projectHeader.projectCode.toLowerCase()}-budget.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleRecordChange = (updatedRecord: BudgetRecord) => {
    setLocalRecord(updatedRecord)
    setHasUnsavedChanges(true)
  }

  const handleSaveDraftAndNavigate = () => {
    if (localRecord) {
      window.localStorage.setItem(draftKey, JSON.stringify(localRecord))
      toast.success("Draft saved successfully")
    }
    setShowConfirmationDialog(false)
    setHasUnsavedChanges(false)

    if (pendingNavigation === 'back') {
      window.history.back()
    } else if (pendingNavigation) {
      navigate(pendingNavigation)
    }
    setPendingNavigation(null)
  }

  const handleClearAndNavigate = () => {
    window.localStorage.removeItem(draftKey)
    setLocalRecord(null)
    setActiveRecord(null)
    setShowConfirmationDialog(false)
    setHasUnsavedChanges(false)

    if (pendingNavigation === 'back') {
      window.history.back()
    } else if (pendingNavigation) {
      navigate(pendingNavigation)
    }
    setPendingNavigation(null)
  }

  const handleDialogClose = () => {
    setShowConfirmationDialog(false)
    setPendingNavigation(null)
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center p-8 text-red-500">Error: {error}</div>
  }

  if (!localRecord) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6 py-12">
        <div className="max-w-xl rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <h1 className="mb-4 text-2xl font-semibold text-foreground">No budget selected</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Use the dashboard to search for a project or create a new budget record first.
          </p>
          <Button onClick={() => navigate("/budget/dashboard")}>Return to dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="h-full flex-1 overflow-auto py-5">
        <ProjectHeader
          record={localRecord}
          onSaveDraft={saveDraft}
          onSaveRecord={saveRecord}
          onDiscardDraft={discardDraft}
          onExportCsv={exportCsv}
        />
        <div className="px-6 mb-5">
          <BudgetValidationAlert
            actualAmounts={null}
            budgetCategories={localRecord.budgetData}
          />
        </div>
        <BudgetTable record={localRecord} onRecordChange={handleRecordChange} />
      </div>

      {localRecord && (
        <DraftConfirmationDialog
          isOpen={showConfirmationDialog}
          onClose={handleDialogClose}
          onSaveDraft={handleSaveDraftAndNavigate}
          onClear={handleClearAndNavigate}
          record={localRecord}
        />
      )}
    </div>
  )
}
