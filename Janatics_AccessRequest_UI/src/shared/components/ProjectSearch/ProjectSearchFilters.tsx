import React from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command"
import { FolderKanban, Package, Search } from "lucide-react"

interface SearchFiltersProps {
  productNo: string
  projectNo: string
  setProductNo: (val: string) => void
  setProjectNo: (val: string) => void
  productSuggestions: any[]
  projectSuggestions: any[]
  showProductSuggestions: boolean
  setShowProductSuggestions: (val: boolean) => void
  showProjectSuggestions: boolean
  setShowProjectSuggestions: (val: boolean) => void
  productRef: React.RefObject<HTMLDivElement>
  projectRef: React.RefObject<HTMLDivElement>
  onSearch: () => void
}

export const ProjectSearchFilters = ({
  productNo,
  projectNo,
  setProductNo,
  setProjectNo,
  productSuggestions,
  projectSuggestions,
  showProductSuggestions,
  setShowProductSuggestions,
  showProjectSuggestions,
  setShowProjectSuggestions,
  productRef,
  projectRef,
  onSearch,
}: SearchFiltersProps) => {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-6 text-[10px] font-black tracking-[0.2em] text-muted-foreground/80 uppercase">
        Project Information
      </h2>

      <div className="flex flex-col items-end gap-6 md:flex-row">
        {/* Product Input */}
        <div className="relative w-full flex-1 space-y-2" ref={productRef}>
          <label className="ml-1 text-xs font-semibold text-foreground/70">
            Product Number
          </label>
          <Input
            placeholder="Type product no..."
            value={productNo}
            onChange={(e) => {
              setProductNo(e.target.value)
              setShowProductSuggestions(true)
            }}
            onFocus={() => setShowProductSuggestions(true)}
            className="h-11 border-border bg-muted/30"
          />
          {showProductSuggestions && productSuggestions.length > 0 && (
            <SuggestionList
              items={productSuggestions}
              onSelect={(item) => {
                setProductNo(item.product_no || "")
                setProjectNo(item.projectnumber)
                setShowProductSuggestions(false)
              }}
              type="product"
            />
          )}
        </div>

        {/* Project Input */}
        <div className="relative w-full flex-1 space-y-2" ref={projectRef}>
          <label className="ml-1 text-xs font-semibold text-foreground/70">
            Project Number
          </label>
          <Input
            placeholder="Search project ID..."
            value={projectNo}
            onChange={(e) => {
              setProjectNo(e.target.value)
              setShowProjectSuggestions(true)
            }}
            onFocus={() => setShowProjectSuggestions(true)}
            className="h-11 border-border bg-muted/30"
          />
          {showProjectSuggestions && projectSuggestions.length > 0 && (
            <SuggestionList
              items={projectSuggestions}
              onSelect={(item) => {
                setProjectNo(item.projectnumber)
                setProductNo(item.product_no || "")
                setShowProjectSuggestions(false)
              }}
              type="project"
            />
          )}
        </div>

        <Button
          onClick={onSearch}
          className="h-11 px-10 font-bold shadow-lg active:scale-95"
        >
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </div>
    </div>
  )
}

// Internal Helper for cleaner JSX
const SuggestionList = ({
  items,
  onSelect,
  type,
}: {
  items: any[]
  onSelect: (item: any) => void
  type: "product" | "project"
}) => (
  <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-xl">
    <Command className="bg-transparent">
      <CommandList>
        <CommandGroup
          heading={type === "product" ? "Product Matches" : "Project Matches"}
        >
          {items.map((item) => (
            <CommandItem
              key={item.projectnumber}
              onSelect={() => onSelect(item)}
              className="flex cursor-pointer items-center gap-3 p-2.5"
            >
              {type === "product" ? (
                <Package className="h-4 w-4 text-primary/60" />
              ) : (
                <FolderKanban className="h-4 w-4 text-primary/60" />
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {type === "product" ? item.product_no : item.projectnumber}
                </span>
                {type === "product" && (
                  <span className="text-[10px] text-muted-foreground">
                    {item.projectname}
                  </span>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  </div>
)
