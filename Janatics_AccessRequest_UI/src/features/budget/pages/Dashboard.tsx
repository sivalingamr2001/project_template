"use client"

import { useMemo, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, FileText } from "lucide-react"
import { toast } from "sonner"

import DataGrid from "@/features/DynamicGrid/components/DataGrid/DataGrid"
import { Button } from "@/shared/components/ui/button"
import { ProjectInformation } from "../components/ProjectInformation"
import CreateBudgetModal from "../components/CreateBudgetModal"
import { useBudget } from "@/providers/Budget/BudgetProvider"
import type { BudgetRecord } from "../types"

export default function Dashboard() {
  const { budgetRecords, fetchBudgetRecords, loading, error } = useBudget()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [draftRecords, setDraftRecords] = useState<BudgetRecord[]>([])

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
    const drafts: BudgetRecord[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("budget-plan-entry-draft")) {
        try {
          const draft = JSON.parse(localStorage.getItem(key)!) as BudgetRecord
          drafts.push(draft)
        } catch (e) {
          // Skip invalid drafts
        }
      }
    }
    setDraftRecords(drafts)
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
      { field: "projectHeader.projectCode", headerName: "Project Number", flex: 1 },
      { field: "projectHeader.productNo", headerName: "Product Number", flex: 1 },
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

  const handleLoadDraft = (record: BudgetRecord) => {
    navigate("/budget/plan-entry", {
      state: { draftRecord: record },
    })
  }

  const draftColumnDefs = useMemo(
    () => [
      {
        field: "projectHeader.productName",
        headerName: "Project Title",
        flex: 1,
        minWidth: 200,
      },
      { field: "projectHeader.projectCode", headerName: "Project Number", flex: 1 },
      { field: "projectHeader.productNo", headerName: "Product Number", flex: 1 },
      {
        field: "projectHeader.lastUpdated",
        headerName: "Last Updated",
        flex: 1,
        cellRenderer: (params: any) => {
          return new Date(params.value).toLocaleDateString()
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

  if (loading) {
    return <div className="flex justify-center p-8">Loading budget records...</div>
  }

  if (error) {
    return <div className="flex justify-center p-8 text-red-500">Error: {error}</div>
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
            title="Budget Records"
            gridId="budget-grid"
            noRowsMessage="No budget records found"
            showSearch={true}
            showRefreshButton={true}
            showClearFiltersButton={true}
            showExportCsvButton={true}
            showSelectedCount={true}
            gridHeight="auto"
            toolbarRight={
              <Button
                size="sm"
                className="gap-2"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Create New Budget
              </Button>
            }
          />
        </div>

        {draftRecords.length > 0 && (
          <div className="animate-in duration-500 fade-in slide-in-from-bottom-4">
            <DataGrid
              rowData={draftRecords as unknown as Record<string, unknown>[]}
              columnDefs={draftColumnDefs}
              title="Draft Budgets"
              gridId="draft-budget-grid"
              noRowsMessage="No draft budgets found"
              showSearch={false}
              showRefreshButton={true}
              showClearFiltersButton={false}
              showExportCsvButton={false}
              showSelectedCount={false}
              gridHeight="auto"
              onRowClicked={(row) => row.data && handleLoadDraft(row.data as unknown as BudgetRecord)}
              toolbarRight={
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={loadDraftRecords}
                >
                  <FileText className="h-4 w-4" />
                  Refresh Drafts
                </Button>
              }
            />
          </div>
        )}

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
      </main>
    </div>
  )
}
