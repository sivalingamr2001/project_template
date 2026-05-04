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
import { FolderKanban, Package, Plus, Search } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { getBudgetById, mapBudgetApiToUi } from "@/features/budget/types"
import type { ProjectData } from "@/types"

export default function ProjectSearchDashboard() {
  const { state, refs, actions } = useProjectSearch()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()

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

  const columnDefs = useMemo(
    () => [
      { field: "product_no", headerName: "Product Number", flex: 1 },
      { field: "projectnumber", headerName: "Project Number", flex: 1 },
      { field: "projectname", headerName: "Product Name", flex: 2 },
      {
        headerName: "Actions",
        pinned: "right" as const,
        width: 100,
        cellRenderer: (params: any) => (
          <Button
            variant="link"
            size="sm"
            onClick={() => handleViewDetails(params.data)}
          >
            View
          </Button>
        ),
      },
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
        showSearch={true}
        showRefreshButton={false}
        showClearFiltersButton={false}
        showExportCsvButton={false}
        gridHeight="500px"
        onClearFilters={actions.clearSearch}
        toolbarRight={
          <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600">
            <Plus className="mr-0 h-4 w-4" /> New Budget
          </Button>
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
