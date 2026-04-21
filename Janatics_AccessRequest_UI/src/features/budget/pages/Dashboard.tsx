"use client"

import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import DataGrid from "@/features/DynamicGrid/components/DataGrid/DataGrid"
import { Button } from "@/shared/components/ui/button"
import {
  getStorageItem,
  isStorageAvailable,
  removeStorageItem,
} from "@/shared/lib/storage"
import { ProjectInformation } from "../components/ProjectInformation"
import CreateBudgetModal from "../components/CreateBudgetModal"
import { useBudget } from "@/providers/Budget/BudgetProvider"
import type { BudgetRecord } from "../types"
import type { StoredDraftRecord } from "../components/draft/DraftModal"
import DraftModal from "../components/draft/DraftModal"

export default function Dashboard() {
  const { budgetRecords, fetchBudgetRecords, loading, error } = useBudget()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [draftRecords, setDraftRecords] = useState<StoredDraftRecord[]>([])
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)

  const STORAGE_NAMESPACE = "budget"
  const DRAFT_STORAGE_PREFIX = "budget-plan-entry-draft"
  const STORAGE_AREA = "local" as const
  const DRAFT_STORAGE_KEY_PREFIX = `${STORAGE_NAMESPACE}_${DRAFT_STORAGE_PREFIX}`

  // Track search params to auto-fill the modal
  const [searchParams, setSearchParams] = useState({
    productNumber: "",
    projectNumber: "",
  })

  const navigate = useNavigate()

  useEffect(() => {
    fetchBudgetRecords()
    loadDraftRecords()
  }, [fetchBudgetRecords])

  const loadDraftRecords = () => {
    if (!isStorageAvailable(STORAGE_AREA)) {
      setDraftRecords([])
      return
    }

    const drafts: StoredDraftRecord[] = []
    const storage = window.localStorage
    const keys: string[] = []

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key && key.startsWith(DRAFT_STORAGE_KEY_PREFIX)) {
        keys.push(key)
      }
    }

    keys.forEach((key) => {
      try {
        const draft = getStorageItem<BudgetRecord>(key, {
          rawKey: true,
          area: STORAGE_AREA,
        })

        if (draft) {
          drafts.push({ ...draft, storageKey: key })
        } else {
          removeStorageItem(key, { rawKey: true, area: STORAGE_AREA })
        }
      } catch {
        removeStorageItem(key, { rawKey: true, area: STORAGE_AREA })
      }
    })

    setDraftRecords(drafts)
  }

  const handleOpenDraft = (record: StoredDraftRecord) => {
    navigate("/budget/plan-entry", {
      state: { draftRecord: record },
    })
  }

  const handleDiscardDraft = (storageKey: string) => {
    if (removeStorageItem(storageKey, { rawKey: true, area: STORAGE_AREA })) {
      toast.success("Draft discarded successfully.")
    }
    loadDraftRecords()
  }

  const handleRefreshDraftSession = () => {
    if (!isStorageAvailable(STORAGE_AREA)) {
      return
    }

    const storage = window.localStorage
    const keysToRemove: string[] = []

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key && key.startsWith(DRAFT_STORAGE_KEY_PREFIX)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach((key) => {
      removeStorageItem(key, { rawKey: true, area: STORAGE_AREA })
    })

    loadDraftRecords()
  }

  const summaryText = useMemo(
    () =>
      "Welcome to the Janatics Budget Portal. Use the dashboard to review your active R&D projects, then create or search for project records using the quick actions below.",
    []
  )

  const columnDefs = useMemo(
    () => [
      {
        field: "projectHeader.productName",
        headerName: "Project Title",
        flex: 1,
        minWidth: 200,
      },
      {
        field: "projectHeader.projectCode",
        headerName: "Project Number",
        flex: 1,
      },
      {
        field: "projectHeader.productNo",
        headerName: "Product Number",
        flex: 1,
      },
      {
        headerName: "Actions",
        field: "actions" as any, // field is optional for action columns
        minWidth: 100,
        maxWidth: 120,
        pinned: "right" as const,
        cellRenderer: (params: any) => {
          return (
            <Button
              variant="link"
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() =>
                navigate("/budget/plan-entry", {
                  state: { record: params.data },
                })
              }
            >
              View
            </Button>
          )
        },
      },
      {
        field: "projectHeader.status",
        headerName: "Status",
        flex: 1,
        cellRenderer: (params: any) => {
          const status = params.value
          const isOnTrack = status === "ON TRACK"
          return (
            <span
              className={`font-semibold ${isOnTrack ? "text-green-600" : "text-red-500"}`}
            >
              {status}
            </span>
          )
        },
      },
    ],
    []
  )

  // Updated handler to receive both the data and the search criteria
  const handleDataUpdate = (
    data: any,
    params: { productNumber: string; projectNumber: string }
  ) => {
    setSearchParams(params)

    const isNotFound = data?.status === 404 || data?.title === "Not found"

    if (isNotFound) {
      // Could filter records here if needed
    }
  }

  async function handleNavigateToPlanEntry(input: {
    productName: string
    projectCode: string
    productNo: string
  }) {
    if (input) {
      toast.success(
        "Draft budget record created. Complete the plan entry to save it."
      )
      setIsModalOpen(false)
      navigate("/budget/plan-entry", {
        state: { fromDashboard: true, inputData: input },
      })
    } else {
      toast.error("Failed to create a new budget record.")
    }
  }

  if (error) {
    return (
      <div className="flex justify-center p-8 text-red-500">Error: {error}</div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:p-4">
      <header className="rounded-sm border border-border bg-card/80 p-6 shadow-sm backdrop-blur md:p-8">
        <div className="max-w-fit">
          <p className="text-sm tracking-[0.24em] text-muted-foreground uppercase">
            Portal overview
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Budget management for R&D projects made simple.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">{summaryText}</p>
        </div>
      </header>

      <main className="space-y-6">
        {/* Pass the updated handler to ProjectInformation */}
        <ProjectInformation onDataReceived={handleDataUpdate} />

        <div className="animate-in duration-500 fade-in slide-in-from-bottom-4">
          <DataGrid
            rowData={budgetRecords as unknown as Record<string, unknown>[]}
            columnDefs={columnDefs}
            loading={loading}
            title="Budget Records"
            gridId="budget-grid"
            noRowsMessage="No budget records found"
            showSearch={true}
            showRefreshButton={false}
            showClearFiltersButton={false}
            showExportCsvButton={false}
            showSelectedCount={true}
            gridHeight="auto"
            toolbarRight={
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create New Budget
                </Button>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsBudgetModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Draft Budget
                </Button>
              </div>
            }
          />
        </div>

        <CreateBudgetModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleNavigateToPlanEntry}
          // Pre-populate modal with search criteria
          initialData={{
            productName: "",
            productNo: searchParams.productNumber,
            projectCode: searchParams.projectNumber,
          }}
        />
        <DraftModal
          open={isBudgetModalOpen}
          onOpenChange={setIsBudgetModalOpen}
          draftRecords={draftRecords}
          onOpenDraft={handleOpenDraft}
          onDiscardDraft={handleDiscardDraft}
          onRefreshDraftSession={handleRefreshDraftSession}
          isActiveDraft={draftRecords.length > 0}
        />
      </main>
    </div>
  )
}
