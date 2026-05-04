import DataGrid from "@/features/DynamicGrid/components/DataGrid/DataGrid"
import CreateBudgetModal from "@/features/budget/components/CreateBudgetModal"
import { Button } from "@/shared/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command"
import { Input } from "@/shared/components/ui/input"
import { useProjectSearch } from "@/shared/hooks/useProjectSearch"
import { FolderKanban, Package, Plus, Search, Trash2 } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  deleteBudget,
  getBudgetById,
  mapBudgetApiToUi,
} from "@/features/budget/types"
import type { ProjectData } from "@/types"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog"
import { useBudget } from "@/providers/Budget/BudgetProvider"
import { apiService } from "@/shared/lib/api-client"

export default function ProjectSearchDashboard() {
  const { state, refs, actions } = useProjectSearch()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState<ProjectData[]>([])
  const [idsToDelete, setIdsToDelete] = useState<number[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { fetchBudgetRecords } = useBudget()

  const currentProductName = useMemo(() => {
    return state.filteredData[0]?.projectname || ""
  }, [state.filteredData])

  const handleViewDetails = useCallback(
    async (row: ProjectData) => {
      // If we don't have a budgetId from search results,
      // prompt user to create a new budget instead
      if (!row.budgetId) {
        toast.info(
          "No budget record found. Please create a new budget for this project."
        )
        setIsModalOpen(true)
        return
      }

      try {
        const response = await getBudgetById(row.budgetId)
        navigate("/plan-entry", {
          state: { record: mapBudgetApiToUi(response) },
        })
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load budget record."
        toast.error(errorMessage)
      }
    },
    [navigate]
  )

  const handleDeleteBudget = (budgetIdOrIds: number | number[]) => {
    const ids = Array.isArray(budgetIdOrIds) ? budgetIdOrIds : [budgetIdOrIds];
    const validIds = ids.filter((id): id is number => Number.isInteger(id));

    if (validIds.length === 0) {
      toast.error("No valid budget records selected.");
      return;
    }

    setIdsToDelete(validIds);
    setIsAlertOpen(true);
  };

  // This performs the actual API call
  const confirmDelete = async () => {
    try {
      await Promise.all(idsToDelete.map((id) => deleteBudget(id)));

      toast.success(`${idsToDelete.length > 1 ? 'Budgets' : 'Budget'} deleted successfully.`);
      setSelectedRows([]); // Clear grid selection
      actions.handleSearch(); // Refresh data
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete the selected items.");
    } finally {
      setIsAlertOpen(false);
      setIdsToDelete([]);
    }
  };

  const handleActivate = async (row: ProjectData[]) => {
    const res = await apiService.patch("/budgets", {
      budgetId: row.map(r => r.budgetId).filter((id): id is number => Number.isInteger(id)),
      IsActive: true
    })

    if(res.status === 200) {
      toast.success("Selected budget(s) activated successfully.");
      setSelectedRows([]);
      navigate("/plan-entry", {
        state: { fromDashboard: true, inputData: row[0] },
      })
    } else {
      toast.error("Failed to activate the selected budget(s).");
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

      await delay(3000);
      await fetchBudgetRecords();

      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Refresh failed:", error);
      toast.error("Failed to refresh records.");
    } finally {
      setLoading(false)
    }
  }


  const hasInactiveSelected = useMemo(
    () => selectedRows.some((row) => row.status?.toLowerCase() === "inactive"),
    [selectedRows]
  )

  const columnDefs = useMemo(
    () => [
      {
        field: "projectname",
        headerName: "Product Name",
        flex: 2,
        cellRenderer: (params: any) => (
          <Button
            type="button"
            onClick={() => handleViewDetails(params.data)}
            className="cursor-pointer"
            variant="link"
          >
            {params.value}
          </Button>
        ),
      },
      { field: "product_no", headerName: "Product Number", flex: 1 },
      { field: "projectnumber", headerName: "Project Number", flex: 1 },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        cellRenderer: (params: any) => {
          const status = params.value?.toLowerCase()

          // Define styles based on status
          const statusStyles: Record<string, string> = {
            active: "bg-green-100 text-green-800 border-green-200",
            inactive: "bg-red-100 text-red-800 border-red-200",
          }

          const currentStyle =
            statusStyles[status] || "bg-gray-100 text-gray-800"

          return (
            <div className="mt-5 flex h-full items-center">
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${currentStyle}`}
              >
                {params.value || "Unknown"}
              </span>
            </div>
          )
        },
      },
      //Remove here and add to table toolbox buttons and only visible the record check box is selected and The active button only the record with inactive status is selected
      // {
      //   headerName: "Actions",
      //   pinned: "right" as const,
      //   cellRenderer: (params: any) => (
      //     <div className="flex justify-center items-center mt-4 gap-2">
      //       {params.data?.status === 'Inactive' && (
      //         <Button
      //           variant="link"
      //           size="sm"
      //           onClick={() => handleViewDetails(params.data)}
      //         >

      //         </Button>
      //       )}

      //       <Button
      //         variant="link"
      //         size="sm"
      //         onClick={() => handleViewDetails(params.data)}
      //       >
      //         <ViewIcon className="mr-2 h-4 w-4" />
      //       </Button>
      //       <Button
      //         className="text-danger"
      //         size="sm"
      //         onClick={() => handleDeleteBudget(params.data.budgetId)}
      //         variant="destructive"
      //       >
      //         <Trash2 className="text-red-600" />
      //       </Button>
      //     </div>
      //   ),
      // },
    ],
    [handleViewDetails]
  )

  async function handleNavigateToPlanEntry(input: {
    productName: string
    projectNumber: string
    productNo: string
  }) {
    toast.success(
      "Draft budget record created. Complete the plan entry to save it."
    )
    setIsModalOpen(false)
    navigate("/plan-entry", {
      state: { fromDashboard: true, inputData: input },
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-sm border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-end gap-6 md:flex-row">
          {/* Product Input */}
          <div
            className="relative w-full flex-1 space-y-2"
            ref={refs.productRef}
          >
            <label className="text-xs font-semibold text-muted-foreground">
              Product Number
            </label>
            <Input
              value={state.productNo}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase()
                actions.setProductNo(e.target.value)
                actions.setShowProductSuggestions(true)
              }}
              onFocus={() => actions.setShowProductSuggestions(true)}
              placeholder="Search Product..."
              className="h-8"
            />
            {state.showProductSuggestions &&
              state.productSuggestions.length > 0 && (
                <SuggestionDropdown
                  items={state.productSuggestions}
                  onSelect={(item) => {
                    actions.handleSelect(item)
                    actions.setShowProductSuggestions(false)
                  }}
                  type="product"
                />
              )}
          </div>

          {/* Project Input */}
          <div
            className="relative w-full flex-1 space-y-2"
            ref={refs.projectRef}
          >
            <label className="text-xs font-semibold text-muted-foreground">
              Project Number
            </label>
            <Input
              value={state.projectNo}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase()
                actions.setProjectNo(e.target.value)
                actions.setShowProjectSuggestions(true)
              }}
              onFocus={() => actions.setShowProjectSuggestions(true)}
              placeholder="Search Project..."
              className="h-8"
            />
            {state.showProjectSuggestions &&
              state.projectSuggestions.length > 0 && (
                <SuggestionDropdown
                  items={state.projectSuggestions}
                  onSelect={(item) => {
                    actions.handleSelect(item)
                    actions.setShowProjectSuggestions(false)
                  }}
                  type="project"
                />
              )}
          </div>

          <Button onClick={actions.handleSearch} className="h-8 px-8">
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
        </div>
      </div>

      <DataGrid
        rowData={state.filteredData}
        columnDefs={columnDefs}
        loading={loading}
        showSearch={true}
        showRefreshButton={true}
        showClearFiltersButton={false}
        showExportCsvButton={false}
        gridHeight="500px"
        onClearFilters={actions.clearSearch}
        onRefresh={handleRefresh}
        onSelectionChanged={(params: any) => {
          setSelectedRows(params)
        }}
        toolbarRight={
          <div className="flex items-center gap-2">
            {selectedRows.length > 0 && (
              <>
                {hasInactiveSelected ? (
                  <Button
                    variant="default"
                    className="border-green-200 bg-green-100 text-green-800"
                    size="sm"
                    onClick={() => handleActivate(selectedRows)}
                  >
                    Activate
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleDeleteBudget(
                        selectedRows
                          .map((r) => r.budgetId)
                          .filter((id): id is number => Number.isInteger(id))
                      )
                    }
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> DeActivate
                  </Button>
                )}
              </>
            )}

            <Button onClick={() => setIsModalOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" /> New Budget
            </Button>
          </div>
        }
      />

      <CreateBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNavigateToPlanEntry}
        initialData={{
          productName: currentProductName,
          productNo: state.productNo,
          projectNumber: state.projectNo,
        }}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {idsToDelete.length}{" "}
              selected budget record{idsToDelete.length > 1 ? "s" : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-700"
            >
              De-Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── HELPER COMPONENTS ───────────────────────────────────────────────────────

interface SuggestionDropdownProps {
  items: ProjectData[]
  onSelect: (item: ProjectData) => void
  type: "product" | "project"
  isLoading?: boolean
}

export function SuggestionDropdown({
  items,
  onSelect,
  type,
  isLoading,
}: SuggestionDropdownProps) {
  // Memoize the mapping to prevent unnecessary re-renders
  const renderedItems = useMemo(() => {
    return items.map((item, index) => {
      const isProduct = type === "product"
      const primaryValue = isProduct ? item.product_no : item.projectnumber

      // FIX: Use index or a truly unique ID to prevent React key warnings
      const uniqueKey = item.id ?? `${primaryValue}-${index}`

      return (
        <CommandItem
          key={uniqueKey}
          value={`${primaryValue}-${uniqueKey}`} // Ensures unique navigation value
          onSelect={() => onSelect(item)}
          className="group flex cursor-pointer items-start gap-3 rounded-sm px-3 py-2.5 outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
        >
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-background">
            {isProduct ? (
              <Package className="h-4 w-4 text-primary/70" />
            ) : (
              <FolderKanban className="h-4 w-4 text-primary/70" />
            )}
          </div>

          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm leading-none font-semibold">
              {primaryValue}
            </span>
            <span className="mt-1 truncate text-xs">
              {isProduct
                ? `Project: ${item.projectnumber}`
                : "View project details"}
            </span>
          </div>
        </CommandItem>
      )
    })
  }, [items, type, onSelect])

  return (
    <div className="absolute z-50 mt-2 w-full min-w-75 animate-in overflow-hidden rounded-xl border bg-popover p-1 shadow-2xl duration-100 zoom-in-95 fade-in">
      <Command shouldFilter={false} className="bg-transparent">
        <CommandList className="max-h-87.5 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Searching...
            </div>
          ) : (
            <>
              <CommandEmpty className="flex flex-col items-center justify-center py-6 text-sm text-muted-foreground">
                <Search className="mb-2 h-8 w-8 opacity-20" />
                No results found.
              </CommandEmpty>

              <CommandGroup
                heading={
                  <span className="px-2 text-[11px] font-bold tracking-wider text-muted-foreground/80 uppercase">
                    {type === "product" ? "Product Matches" : "Project Matches"}
                  </span>
                }
              >
                {renderedItems}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </div>
  )
}
