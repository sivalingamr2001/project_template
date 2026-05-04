import { useAuth } from "@/providers/auth-provider"
import { useBudget } from "@/providers/Budget/BudgetProvider"
import { useNavigationBlock } from "@/providers/NavigationBlockProvider"
import { Button } from "@/shared/components/ui/button"
import {
  getStorageItem,
  removeStorageItem,
  setStorageItem,
} from "@/shared/lib/storage"
import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { BudgetValidationAlert } from "../components/BudgetValidationAlert"
import { DraftConfirmationDialog } from "../components/DraftConfirmationDialog"
import type { StoredDraftRecord } from "../components/draft/DraftModal"
import { BudgetTable } from "../components/plan-entry/BudgetTable"
import { ProjectHeader } from "../components/plan-entry/ProjectHeader"
import type { BudgetRecord } from "../types"
import { exportBudgetWorkbook } from "../utils/exportBudgetWorkbook"
import {
  budgetTemplateApi,
  mapTemplateToOption,
  TEMPLATE_SESSION_KEY,
  templateToBudgetData,
  type TemplateCategory,
  type TemplateOption,
} from "../utils/budgetTemplates"

const DRAFT_KEY_PREFIX = "budget-plan-entry-draft"
const DRAFT_TTL_MINUTES = 60 * 24 * 7

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

function loadTemplateFromSessionStorage(): TemplateCategory[] | null {
  if (typeof window === "undefined") {
    return null
  }

  const stored = window.sessionStorage.getItem(TEMPLATE_SESSION_KEY)
  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored) as TemplateCategory[]
  } catch {
    return null
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
  const [activeDraftStorageKey, setActiveDraftStorageKey] = useState<
    string | null
  >(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  )
  const [templateOptions, setTemplateOptions] = useState<TemplateOption[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [isExporting, setIsExporting] = useState(false)

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
        setSelectedTemplateId((current) => current || options[0]?.id || "")
      } catch (fetchError) {
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

  const draftStorageBaseKey = useMemo(
    () => `${DRAFT_KEY_PREFIX}:${user?.employeeId ?? "guest"}`,
    [user?.employeeId]
  )

  const draftStorageKey = useMemo(
    () => (localRecord ? `${draftStorageBaseKey}:${localRecord.id}` : null),
    [draftStorageBaseKey, localRecord?.id]
  )

  useEffect(() => {
    const state = location.state as {
      fromDashboard?: boolean
      record?: BudgetRecord
      inputData?: {
        productName: string
        projectNumber: string
        productNo: string
      }
      draftRecord?: BudgetRecord
    } | null

    const sessionTemplate = loadTemplateFromSessionStorage()

    if (state?.record) {
      setLocalRecord(state.record)
      setActiveRecord(state.record)
      return
    }

    if (state?.draftRecord) {
      setLocalRecord(state.draftRecord)
      setActiveRecord(state.draftRecord)
      setActiveDraftStorageKey(
        (state.draftRecord as StoredDraftRecord).storageKey ?? null
      )
      return
    }

    if (state?.inputData) {
      const fallbackTemplate =
        sessionTemplate ?? templateOptions[0]?.categories ?? []

      if (fallbackTemplate.length === 0) {
        return
      }

      const newRecord = createLocalBudgetRecord({
        ...state.inputData,
        employeeId: user?.employeeId ?? 0,
        categories: fallbackTemplate,
      })

      if (sessionTemplate) {
        window.sessionStorage.removeItem(TEMPLATE_SESSION_KEY)
      }

      setLocalRecord(newRecord)
      setActiveRecord(newRecord)
      return
    }

    if (sessionTemplate) {
      const newRecord = createLocalBudgetRecord({
        productName: "Selected Budget Template",
        projectNumber: "",
        productNo: "",
        employeeId: user?.employeeId ?? 0,
        categories: sessionTemplate,
      })
      window.sessionStorage.removeItem(TEMPLATE_SESSION_KEY)
      setLocalRecord(newRecord)
      setActiveRecord(newRecord)
      toast.success("Loaded budget template into plan entry.")
      return
    }

    try {
      if (!user?.employeeId) {
        return
      }

      const storage = window.localStorage
      const keyPrefix = `budget_${draftStorageBaseKey}:`
      let latestDraft: BudgetRecord | null = null
      let latestUpdated = 0

      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index)
        if (!key || !key.startsWith(keyPrefix)) {
          continue
        }

        const parsed = getStorageItem<BudgetRecord>(key, {
          rawKey: true,
          area: "local",
        })

        if (!parsed || !parsed.id || !parsed.projectHeader?.projectNumber) {
          removeStorageItem(key, { rawKey: true, area: "local" })
          continue
        }

        const updated = new Date(parsed.projectHeader.lastUpdated).getTime()
        if (Number.isFinite(updated) && updated > latestUpdated) {
          latestUpdated = updated
          latestDraft = parsed
        }
      }

      if (latestDraft) {
        setLocalRecord(latestDraft)
        setActiveRecord(latestDraft)
      }
    } catch {
      // ignore local storage recovery errors
    }
  }, [
    draftStorageBaseKey,
    location.state,
    setActiveRecord,
    templateOptions,
    user?.employeeId,
  ])

  useEffect(() => {
    if (!localRecord || !draftStorageKey) {
      return
    }

    setStorageItem(draftStorageKey, localRecord, {
      namespace: "budget",
      area: "local",
      expiresInMinutes: DRAFT_TTL_MINUTES,
    })
  }, [localRecord, draftStorageKey])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault()
        event.returnValue = ""
      }
    }

    const handlePopState = (event: PopStateEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault()
        setShowConfirmationDialog(true)
        setPendingNavigation("back")
        window.history.pushState(null, "", window.location.pathname)
      }
    }

    if (hasUnsavedChanges) {
      window.addEventListener("beforeunload", handleBeforeUnload)
      window.addEventListener("popstate", handlePopState)
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [hasUnsavedChanges])

  useEffect(() => {
    if (hasUnsavedChanges && localRecord) {
      onBlock(
        `You have unsaved changes for ${localRecord.projectHeader.productName} (${localRecord.projectHeader.projectNumber}). Would you like to save as draft or clear?`,
        localRecord
      )
    } else {
      onUnblock()
    }
  }, [hasUnsavedChanges, localRecord, onBlock, onUnblock])

  const delay = (ms: number | undefined) =>
    new Promise((resolve) => setTimeout(resolve, ms))

  const resetDraftState = () => {
    if (activeDraftStorageKey) {
      removeStorageItem(activeDraftStorageKey, {
        rawKey: true,
        area: "local",
      })
      setActiveDraftStorageKey(null)
    }

    if (draftStorageKey) {
      removeStorageItem(draftStorageKey, {
        namespace: "budget",
        area: "local",
      })
    }

    setLocalRecord(null)
    setActiveRecord(null)
    setHasUnsavedChanges(false)
    setShowConfirmationDialog(false)
    setPendingNavigation(null)
    onUnblock()
  }

  const saveRecord = async () => {
    if (!localRecord) {
      return
    }

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
      } else {
            await updateBudgetRecord(recordToSave.id, recordToSave)
        toast.success("Changes saved! Redirecting...")
      }

      resetDraftState()
      await delay(2000)
      navigate("/dashboard")
    } catch (saveError) {
      const errorMessage =
        saveError &&
        typeof saveError === "object" &&
        "message" in saveError &&
        typeof saveError.message === "string"
          ? saveError.message
          : "Failed to save budget record"

      toast.error(errorMessage)
    }
  }

  const discardDraft = () => {
    resetDraftState()
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

  const handleTemplateChange = (value: string) => {
    setSelectedTemplateId(value)
    const option = templateOptions.find((template) => template.id === value)

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

  const handleSaveDraftAndNavigate = () => {
    if (localRecord && draftStorageKey) {
      setStorageItem(draftStorageKey, localRecord, {
        namespace: "budget",
        area: "local",
        expiresInMinutes: DRAFT_TTL_MINUTES,
      })
      toast.success("Draft saved successfully")
    }

    setShowConfirmationDialog(false)
    setHasUnsavedChanges(false)

    if (pendingNavigation === "back") {
      window.history.back()
    } else if (pendingNavigation) {
      navigate(pendingNavigation)
    }

    setPendingNavigation(null)
  }

  const handleClearAndNavigate = () => {
    if (draftStorageKey) {
      removeStorageItem(draftStorageKey, {
        namespace: "budget",
        area: "local",
      })
    }

    setLocalRecord(null)
    setActiveRecord(null)
    setShowConfirmationDialog(false)
    setHasUnsavedChanges(false)

    if (pendingNavigation === "back") {
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
          onDiscardDraft={discardDraft}
          onExportCsv={exportWorkbook}
          isExporting={isExporting}
          selectedTemplateId={selectedTemplateId}
          onTemplateChange={handleTemplateChange}
          templateOptions={templateOptions}
        />
        <div className="mb-5 px-6">
          <BudgetValidationAlert
            actualAmounts={null}
            budgetCategories={localRecord.budgetData}
          />
        </div>
        <BudgetTable record={localRecord} onRecordChange={handleRecordChange} />
      </div>

      <DraftConfirmationDialog
        isOpen={showConfirmationDialog}
        onClose={handleDialogClose}
        onSaveDraft={handleSaveDraftAndNavigate}
        onClear={handleClearAndNavigate}
        record={localRecord}
      />
    </div>
  )
}
