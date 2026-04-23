import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/shared/components/ui/button"
import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import type { BudgetRecord } from "../types"
import { useBudget } from "@/providers/Budget/BudgetProvider"
import { useNavigationBlock } from "@/providers/NavigationBlockProvider"
import { toast } from "sonner"
import {
  getStorageItem,
  removeStorageItem,
  setStorageItem,
} from "@/shared/lib/storage"
import { ProjectHeader } from "../components/plan-entry/ProjectHeader"
import type { StoredDraftRecord } from "../components/draft/DraftModal"
import { BudgetValidationAlert } from "../components/BudgetValidationAlert"
import { BudgetTable } from "../components/plan-entry/BudgetTable"
import { DraftConfirmationDialog } from "../components/DraftConfirmationDialog"
import { exportBudgetWorkbook } from "../utils/exportBudgetWorkbook"
import {
  getTemplateOptions,
  TEMPLATE_SESSION_KEY,
  templateToBudgetData,
  type TemplateCategory,
} from "../utils/budgetTemplates"

const DRAFT_KEY_PREFIX = "budget-plan-entry-draft"
const DRAFT_TTL_MINUTES = 60 * 24 * 7

function createLocalBudgetRecord(input: {
  productName: string
  projectCode: string
  productNo: string
  employeeId: number
  categories: TemplateCategory[]
}): BudgetRecord {
  return {
    id: `draft-${Date.now()}`,
    projectHeader: {
      employeeId: input.employeeId,
      productName: input.productName,
      projectCode: input.projectCode,
      productNo: input.productNo,
      phase: "Product development",
      department: "Research and Development",
      status: "ON TRACK",
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

export default function PlanEntry() {
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
  const [activeDraftStorageKey, setActiveDraftStorageKey] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  )
  const templateOptions = useMemo(() => getTemplateOptions(), [])
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    () => templateOptions[0]?.id ?? ""
  )

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
        projectCode: string
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
        projectCode: "",
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

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)
        if (!key || !key.startsWith(keyPrefix)) {
          continue
        }

        const parsed = getStorageItem<BudgetRecord>(key, {
          rawKey: true,
          area: "local",
        })

        if (!parsed || !parsed.id || !parsed.projectHeader?.projectCode) {
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
      // ignore
    }
  }, [draftStorageBaseKey, location.state, setActiveRecord, templateOptions, user?.employeeId])

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

  // Handle browser back button and beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        setShowConfirmationDialog(true)
        setPendingNavigation("back")
        // Push the current state back to prevent navigation
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

  // Update navigation block when unsaved changes change
  useEffect(() => {
    if (hasUnsavedChanges && localRecord) {
      onBlock(
        `You have unsaved changes for ${localRecord.projectHeader.productName} (${localRecord.projectHeader.projectCode}). Would you like to save as draft or clear?`,
        localRecord
      )
    } else {
      onUnblock()
    }
  }, [hasUnsavedChanges, localRecord, onBlock, onUnblock])

  // Helper to create a delay
  const delay = (ms: number | undefined) =>
    new Promise((res) => setTimeout(res, ms))

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
    if (!localRecord) return

    const recordToSave = {
      ...localRecord,
      projectHeader: {
        ...localRecord.projectHeader,
        employeeId:
          localRecord.projectHeader.employeeId || user?.employeeId || 0,
      },
    }

    try {
      if (recordToSave.id.startsWith("draft-")) {
        const createPayload = {
          projectHeader: recordToSave.projectHeader,
          budgetData: recordToSave.budgetData,
        }
        await createBudgetRecord(createPayload)
        toast.success("Record created! Redirecting...")
      } else {
        await updateBudgetRecord(recordToSave.id, recordToSave)
        toast.success("Changes saved! Redirecting...")
      }

      resetDraftState()

      // Wait for the toast to be visible before navigating away.
      await delay(2000)

      navigate("/dashboard")
    } catch (err) {
      const errorMessage =
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof err.message === "string"
          ? err.message
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

    try {
      await exportBudgetWorkbook(localRecord)
      toast.success("Budget workbook exported successfully")
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to export budget workbook"
      toast.error(errorMessage)
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
      <div className="h-full flex-1 overflow-auto py-5">
        <ProjectHeader
          record={localRecord}
          onSaveRecord={saveRecord}
          onDiscardDraft={discardDraft}
          onExportCsv={exportWorkbook}
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
