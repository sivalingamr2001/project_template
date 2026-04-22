import DataGrid from "@/features/DynamicGrid/components/DataGrid/DataGrid"
import CreateBudgetModal from "@/features/budget/components/CreateBudgetModal"
import { Button } from "@/shared/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command"
import { Input } from "@/shared/components/ui/input"
import { useProjectSearch } from "@/shared/hooks/useProjectSearch"
import type { ProjectData } from "@/types"
import { FolderKanban, Package, Plus, Search } from "lucide-react"
import { useMemo, useState } from "react"

export default function ProjectSearchDashboard() {
  const { state, refs, actions } = useProjectSearch()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const currentProductName = useMemo(() => {
    return state.filteredData[0]?.projectname || ""
  }, [state.filteredData])

  const columnDefs = useMemo(
    () => [
      { field: "product_no", headerName: "Product No", flex: 1 },
      { field: "projectnumber", headerName: "Project Number", flex: 1 },
      { field: "projectname", headerName: "Project Name", flex: 2 },
      { field: "project_category", headerName: "Category", flex: 1.5 },
      {
        headerName: "Actions",
        pinned: "right" as const,
        width: 100,
        cellRenderer: (params: any) => (
          <Button
            variant="link"
            size="sm"
            onClick={() => console.log(params.data)}
          >
            View
          </Button>
        ),
      },
    ],
    []
  )

  return (
    <div className="flex min-h-screen flex-col gap-2">
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
                  // Ensure we pass the current search term to compare if needed
                  searchTerm={state.productNo}
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
                  searchTerm={state.projectNo}
                />
              )}
          </div>

          <Button
            onClick={actions.handleSearch}
            className="h-8 px-8"
            disabled={state.isLoading}
          >
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
        </div>
      </div>

      <DataGrid
        rowData={state.filteredData}
        columnDefs={columnDefs}
        gridHeight="500px"
        toolbarRight={
          <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600">
            <Plus className="mr-2 h-4 w-4" /> Create New Budget
          </Button>
        }
      />

      <CreateBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={{
          productName: currentProductName,
          productNo: state.productNo,
          projectCode: state.projectNo,
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
  searchTerm: string
}

function SuggestionDropdown({
  items,
  onSelect,
  type,
  searchTerm,
}: SuggestionDropdownProps) {
  return (
    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-xl">
      {/* 🚀 CRITICAL: shouldFilter={false} prevents the component from hiding results */}
      <Command shouldFilter={false}>
        <CommandList>
          <CommandGroup
            heading={type === "product" ? "Product Matches" : "Project Matches"}
          >
            {items.map((item) => {
              const displayValue =
                type === "product" ? item.product_no : item.projectnumber

              return (
                <CommandItem
                  key={`${item.projectnumber}-${item.product_no}`}
                  // value is used for internal keyboard navigation
                  value={displayValue}
                  onSelect={() => onSelect(item)}
                  className="flex cursor-pointer gap-3 p-2"
                >
                  {type === "product" ? (
                    <Package className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <FolderKanban className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium">
                      {displayValue}
                    </span>
                    {item.projectname && (
                      <span className="truncate text-[10px] text-muted-foreground">
                        {item.projectname}
                      </span>
                    )}
                  </div>
                </CommandItem>
              )
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}
