import { Button } from "@/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import localData from "@/data/plmSampleData.json"
import type { ColDef } from "ag-grid-community"
import { FolderKanban, Package, Plus, Search } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import DataGrid from "../DynamicGrid/components/DataGrid/DataGrid"

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface ProjectData {
  projectnumber: string
  projectname: string
  description: string
  project_category?: string
  sub_category?: string
  product_no?: string
  last_update_date?: string
  [key: string]: any
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function ProjectSearchDashboard() {
  const [productNo, setProductNo] = useState("")
  const [projectNo, setProjectNo] = useState("")

  // Data State: Table starts empty or with full data based on preference
  const [filteredData, setFilteredData] = useState<ProjectData[]>(
    localData.items as ProjectData[]
  )

  // Suggestion States
  const [productSuggestions, setProductSuggestions] = useState<ProjectData[]>(
    []
  )
  const [projectSuggestions, setProjectSuggestions] = useState<ProjectData[]>(
    []
  )
  const [showProductSuggestions, setShowProductSuggestions] = useState(false)
  const [showProjectSuggestions, setShowProjectSuggestions] = useState(false)
  const [, setIsModalOpen] = useState(false)

  const productRef = useRef<HTMLDivElement>(null)
  const projectRef = useRef<HTMLDivElement>(null)

  const handleViewDetails = (params: any) => {
    console.log("Viewing project:", params.data)
    // Add your navigation or modal logic here
    alert(
      `Project: ${params.data.projectnumber}\nName: ${params.data.projectname}`
    )
  }

  const columnDefs = useMemo<ColDef<ProjectData>[]>(
    () => [
      { field: "product_no", headerName: "Product No", flex: 1, minWidth: 120 },
      {
        field: "projectnumber",
        headerName: "Project Number",
        flex: 1,
        minWidth: 130,
      },
      {
        field: "projectname",
        headerName: "Project Name",
        flex: 2,
        minWidth: 250,
      },
      { field: "project_category", headerName: "Category", flex: 1.5 },
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
              onClick={() => {
                handleViewDetails(params)
              }}
            >
              View
            </Button>
          )
        },
      },
    ],
    []
  )

  // 1. Suggestion Logic (Filtered as you type)
  useEffect(() => {
    const term = productNo.toLowerCase().trim()
    setProductSuggestions(
      term
        ? (localData.items as ProjectData[])
            .filter((i) => i.product_no?.toLowerCase().includes(term))
            .slice(0, 6)
        : []
    )
  }, [productNo])

  useEffect(() => {
    const term = projectNo.toLowerCase().trim()
    setProjectSuggestions(
      term
        ? (localData.items as ProjectData[])
            .filter((i) => i.projectnumber?.toLowerCase().includes(term))
            .slice(0, 6)
        : []
    )
  }, [projectNo])

  // 2. Click Outside Handler
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (productRef.current && !productRef.current.contains(e.target as Node))
        setShowProductSuggestions(false)
      if (projectRef.current && !projectRef.current.contains(e.target as Node))
        setShowProjectSuggestions(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // 3. Search Action (Filters Table)
  const handleSearch = () => {
    const pTerm = productNo.toLowerCase().trim()
    const projTerm = projectNo.toLowerCase().trim()

    if (!pTerm && !projTerm) {
      setFilteredData(localData.items as ProjectData[])
      return
    }

    const results = (localData.items as ProjectData[]).filter((item) => {
      const matchProd = pTerm
        ? item.product_no?.toLowerCase().includes(pTerm)
        : false
      const matchProj = projTerm
        ? item.projectnumber?.toLowerCase().includes(projTerm)
        : false
      return matchProd || matchProj
    })

    setFilteredData(results)
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-background p-4 transition-colors md:p-0">
      {/* HEADER SECTION */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
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
              className="h-11 border-border bg-muted/30 focus-visible:ring-primary"
            />
            {showProductSuggestions && productSuggestions.length > 0 && (
              <div className="absolute z-50 mt-1 w-full animate-in rounded-md border border-border bg-popover shadow-xl zoom-in-95 fade-in">
                <Command className="bg-transparent">
                  <CommandList>
                    <CommandGroup heading="Product Matches">
                      {productSuggestions.map((item) => (
                        <CommandItem
                          key={item.projectnumber}
                          onSelect={() => {
                            setProductNo(item.product_no || "")
                            setProjectNo(item.projectnumber)
                            setShowProductSuggestions(false)
                          }}
                          className="flex cursor-pointer items-center gap-3 p-2.5 transition-colors hover:bg-accent"
                        >
                          <Package className="h-4 w-4 text-primary/60" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {item.product_no}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {item.projectname}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
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
              <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-xl">
                <Command className="bg-transparent">
                  <CommandList>
                    <CommandGroup heading="Project Matches">
                      {projectSuggestions.map((item) => (
                        <CommandItem
                          key={item.projectnumber}
                          onSelect={() => {
                            setProjectNo(item.projectnumber)
                            setProductNo(item.product_no || "")
                            setShowProjectSuggestions(false)
                          }}
                          className="flex cursor-pointer items-center gap-3 p-2.5 transition-colors"
                        >
                          <FolderKanban className="h-4 w-4 text-primary/60" />
                          <span className="text-sm font-medium">
                            {item.projectnumber}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            )}
          </div>

          <Button
            className="h-11 bg-primary px-10 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-95"
            onClick={handleSearch}
          >
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="flex-1">
        <DataGrid<ProjectData>
          gridHeight="465px"
          gridId="plm-project-grid"
          title="Project List"
          rowData={filteredData}
          pageSize={5}
          pageSizeOptions={[5, 10, 20]}
          noRowsMessage="No projects match your search criteria"
          rowSelection="none"
          columnDefs={columnDefs}
          showSearch={true}
          showRefreshButton={false}
          showClearFiltersButton={false}
          showExportCsvButton={false}
          showSelectedCount={false}
          toolbarRight={
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Create New Budget
              </Button>
            </div>
          }
        />
      </div>
    </div>
  )
}
