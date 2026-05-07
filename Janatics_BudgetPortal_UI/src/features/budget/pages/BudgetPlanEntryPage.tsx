import { useAuth } from "@/providers/auth-provider"
import { useBudget } from "@/providers/Budget/BudgetProvider"
import { useNavigationBlock } from "@/providers/NavigationBlockProvider"
import { Button } from "@/shared/components/ui/button"
import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { BudgetValidationAlert } from "../components/BudgetValidationAlert"
import { BudgetTable } from "../components/plan-entry/BudgetTable"
import { ProjectHeader } from "../components/plan-entry/ProjectHeader"
import type { BudgetRecord } from "../types"
import { exportBudgetWorkbook } from "../utils/exportBudgetWorkbook"
import {
  budgetTemplateApi,
  mapTemplateToOption,
  templateToBudgetData,
  type TemplateCategory,
  type TemplateOption,
} from "../utils/budgetTemplates"

function createLocalBudgetRecord(input: {
  productName: string
  projectNumber: string
  productNo: string
  employeeId: number
  categories: TemplateCategory[]
}): BudgetRecord {
  return {
    id: `draft-${Date.now()}`,
    projectHeader: {
      employeeId: input.employeeId,
      productName: input.productName,
      projectNumber: input.projectNumber,
      productNo: input.productNo,
      phase: "Product development",
      department: "Research and Development",
      status: "ON TRACK",
      approvalStatus: "Pending",
      isActive: true,
      lastUpdated: new Date().toISOString(),
    },
    budgetData: templateToBudgetData(input.categories),
  }
}

export default function BudgetPlanEntryPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    setActiveRecord,
    createBudgetRecord,
    updateBudgetRecord,
    loading,
    error,
  } = useBudget()
  const { onBlock, onUnblock } = useNavigationBlock()
  const [localRecord, setLocalRecord] = useState<BudgetRecord | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [templateOptions, setTemplateOptions] = useState<TemplateOption[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [draftRecord, setDraftRecord] = useState<BudgetRecord | null>(null)
  const stateData = location.state

  useEffect(() => {
    let isMounted = true

    const fetchTemplates = async () => {
      try {
        const response = await budgetTemplateApi.getAll(1, 100)
        const options = response.data.data.data.map(mapTemplateToOption)

        if (!isMounted) {
          return
        }

        setTemplateOptions(options)
        setSelectedTemplateId(stateData?.record?.templateId || 0)
      } catch {
        if (isMounted) {
          toast.error("Unable to load budget templates")
        }
      }
    }

    void fetchTemplates()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const state = location.state as {
      record?: BudgetRecord
      inputData?: {
        productName: string
        projectNumber: string
        productNo: string
      }
      templateCategories?: TemplateCategory[]
    } | null

    if (draftRecord) {
      setLocalRecord(draftRecord)
      return
    }

    if (state?.record) {
      setLocalRecord(state.record)
      setActiveRecord(state.record)
      return
    }

    const fallbackTemplate =
      state?.templateCategories ?? templateOptions[0]?.categories ?? []

    if (state?.inputData && fallbackTemplate.length > 0) {
      const newRecord = createLocalBudgetRecord({
        ...state.inputData,
        employeeId: user?.employeeId ?? 0,
        categories: fallbackTemplate,
      })

      setLocalRecord(newRecord)
      setActiveRecord(newRecord)
      return
    }

    if (state?.templateCategories && state.templateCategories.length > 0) {
      const newRecord = createLocalBudgetRecord({
        productName: "Selected Budget Template",
        projectNumber: "",
        productNo: "",
        employeeId: user?.employeeId ?? 0,
        categories: state.templateCategories,
      })

      setLocalRecord(newRecord)
      setActiveRecord(newRecord)
      toast.success("Loaded budget template into plan entry.")
    }
  }, [location.state, setActiveRecord, templateOptions, user?.employeeId])

  useEffect(() => {
    // Use a key unique to the record or project
    const storageKey = `failed_save_${localRecord?.id}`
    const savedData = localStorage.getItem(storageKey)

    if (savedData) {
      const parsedData = JSON.parse(savedData)

      // Logic to populate your state (e.g., setLocalRecord)
      setDraftRecord(parsedData)

      toast.info("Restored unsaved changes from a previous failed attempt.")
    }
  }, [localRecord?.id])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault()
        event.returnValue = ""
      }
    }

    if (hasUnsavedChanges) {
      window.addEventListener("beforeunload", handleBeforeUnload)
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  useEffect(() => {
    if (hasUnsavedChanges && localRecord) {
      onBlock(
        `You have unsaved changes for ${localRecord.projectHeader.productName} (${localRecord.projectHeader.projectNumber}).`,
        localRecord
      )
    } else {
      onUnblock()
    }
  }, [hasUnsavedChanges, localRecord, onBlock, onUnblock])

  const delay = (ms: number | undefined) =>
    new Promise((resolve) => setTimeout(resolve, ms))

  const resetEditorState = () => {
    setLocalRecord(null)
    setActiveRecord(null)
    setHasUnsavedChanges(false)
    onUnblock()
  }

  const saveRecord = async () => {
    if (!localRecord) return

    const recordToSave = {
      ...localRecord,
      projectHeader: {
        ...localRecord.projectHeader,
        employeeId: user?.employeeId || 0,
      },
    }

    try {
      if (recordToSave.id.startsWith("draft-")) {
        await createBudgetRecord({
          projectHeader: recordToSave.projectHeader,
          templateId:
            Number(selectedTemplateId) || templateOptions[0]?.templateId || 1,
          budgetData: recordToSave.budgetData,
        })
        toast.success("Record created! Redirecting...")
        localStorage.removeItem(`failed_save_${localRecord?.id}`)
      } else {
        await updateBudgetRecord(recordToSave.id, {
          projectHeader: recordToSave.projectHeader,
          budgetData: recordToSave.budgetData,
        })
        toast.success("Changes saved! Redirecting...")
      }

      // Success: Clear any previous draft for this specific record
      localStorage.removeItem(`failed_save_${recordToSave.id}`)

      resetEditorState()
      await delay(2000)
      navigate("/dashboard")
    } catch (saveError) {
      // 💡 Save to LocalStorage on Failure
      const storageKey = `failed_save_${recordToSave.id}`
      localStorage.setItem(storageKey, JSON.stringify(recordToSave))

      const errorMessage = "Failed to save. Data backed up locally."
      toast.error(errorMessage)
    }
  }

  const discardChanges = () => {
    resetEditorState()
    navigate("/dashboard")
  }

  const exportWorkbook = async () => {
    if (!localRecord) {
      return
    }

    if (localRecord.id.startsWith("draft-")) {
      toast.error("Save the budget record before exporting the Excel report.")
      return
    }

    const budgetId = Number(localRecord.id)
    if (!Number.isInteger(budgetId) || budgetId <= 0) {
      toast.error("This budget record cannot be exported yet.")
      return
    }

    try {
      setIsExporting(true)
      await exportBudgetWorkbook(budgetId)
      toast.success("Budget workbook exported successfully")
    } catch (exportError) {
      const errorMessage =
        exportError instanceof Error
          ? exportError.message
          : "Failed to export budget workbook"

      toast.error(errorMessage)
    } finally {
      setIsExporting(false)
    }
  }

  const handleRecordChange = (updatedRecord: BudgetRecord) => {
    setLocalRecord(updatedRecord)
    setHasUnsavedChanges(true)
  }

  const handleTemplateChange = (value: number) => {
    setSelectedTemplateId(value)
    const option = templateOptions.find(
      (template) => template.templateId === selectedTemplateId
    )

    if (!option) {
      return
    }

    setLocalRecord((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        projectHeader: {
          ...current.projectHeader,
          lastUpdated: new Date().toISOString(),
        },
        budgetData: templateToBudgetData(option.categories),
      }
    })

    setHasUnsavedChanges(true)
    toast.success(`Applied template: ${option.name}`)
  }

  const hasTemplateOptions = useMemo(
    () => templateOptions.length > 0,
    [templateOptions]
  )

  if (loading) {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="animate-pulse text-sm font-medium text-muted-foreground">
          Loading budget details...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center p-8 text-red-500">Error: {error}</div>
    )
  }

  if (!localRecord) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6 py-12">
        <div className="max-w-xl rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <h1 className="mb-4 text-2xl font-semibold text-foreground">
            No budget selected
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Use the dashboard to search for a project or create a new budget
            record first.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Return to dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="h-full flex-1 overflow-auto p-0">
        <ProjectHeader
          record={localRecord}
          onSaveRecord={saveRecord}
          onDiscardChanges={discardChanges}
          onExportCsv={exportWorkbook}
          isExporting={isExporting}
          selectedTemplateId={selectedTemplateId}
          onTemplateChange={handleTemplateChange}
          templateOptions={hasTemplateOptions ? templateOptions : []}
        />
        <div className="mb-5 px-6">
          <BudgetValidationAlert
            actualAmounts={null}
            budgetCategories={localRecord.budgetData}
          />
        </div>
        <BudgetTable record={localRecord} onRecordChange={handleRecordChange} />
      </div>
    </div>
  )
}
