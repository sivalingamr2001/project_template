"use client"

import { useBudget } from "@/providers/Budget/BudgetProvider"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"
import { apiService } from "@/shared/lib/api-client"
import { cn, useDebounce } from "@/shared/lib/utils"
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

interface ProjectInformationProps {
  onDataReceived: (
    data: any,
    params: { productNumber: string; projectNumber: string }
  ) => void
}

type ProjectSearchResult = {
  productNo?: string
  projectNumber?: string
  projectTitle?: string
}

export function ProjectInformation({
  onDataReceived,
}: ProjectInformationProps) {
  const [open, setOpen] = React.useState(false)
  const [productNumber, setProductNumber] = React.useState("")
  const [projectNumber, setProjectNumber] = React.useState("")
  const [projects, setProjects] = React.useState<ProjectSearchResult[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const [isFetchingDetails, setIsFetchingDetails] = React.useState(false)
  const { fetchBudgetRecordById } = useBudget()

  const debouncedProduct = useDebounce(productNumber, 500)

  React.useEffect(() => {
    const fetchProjects = async () => {
      if (debouncedProduct.length <= 3) return
      setIsSearching(true)

      try {
        const res = await apiService.get(`/budgets/search?productNo=${debouncedProduct}`)
        const data = res.data as ProjectSearchResult[]
        setProjects(Array.isArray(data) ? data : [])
        toast.success(`${data.length} projects found.`)
      } catch {
        setProjects([])
        toast.error("Failed to fetch projects.")
      } finally {
        setIsSearching(false)
      }
    }

    fetchProjects()
  }, [debouncedProduct])

  const handleFetchDetails = async () => {
    if (!productNumber || !projectNumber) return
    setIsFetchingDetails(true)

    const searchParams = { productNumber, projectNumber }

    try {
      const data = await fetchBudgetRecordById(projectNumber, productNumber)
      onDataReceived(data, searchParams)
      toast.success("Project details fetched successfully!")
    } catch {
      toast.error(
        "Project details not found. Please check the project and product numbers."
      )
      onDataReceived({ status: 404 }, searchParams)
    } finally {
      setIsFetchingDetails(false)
    }
  }

  return (
    <Card className="overflow-hidden rounded-sm border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold tracking-wider uppercase">
          Project Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid items-end gap-3 md:grid-cols-[44%_44%_10%]">
          {/* Column 1: Manual Search Input */}
          <div className="space-y-2">
            <Label>Product Number</Label>
            <Input
              value={productNumber}
              onChange={(e) => {
                setProductNumber(e.target.value)
                setProjectNumber("") // Reset dropdown when search changes
              }}
              placeholder="Enter product number..."
              className="font-mono"
            />
          </div>

          {/* Column 2: Search-based Dropdown */}
          <div className="space-y-2">
            <Label>Project Number</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal"
                >
                  <span className="truncate">
                    {projectNumber || "Select Project... or enter product number to search"}
                  </span>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin opacity-50" />
                  ) : (
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-(--radix-popover-trigger-width) p-0"
                align="start"
              >
                <Command>
                  <CommandInput
                    placeholder="Filter projects..."
                    onValueChange={(val) => {
                      setProjectNumber(val)
                    }}
                  />
                  <CommandList className="max-h-50">
                    {isSearching && (
                      <div className="p-4 text-center text-xs">
                        Searching...
                      </div>
                    )}
                    <CommandEmpty>No projects found.</CommandEmpty>
                    <CommandGroup>
                      {projects.map((p, index) => {
                        const projectKey =
                          p.projectNumber ?? p.productNo ?? String(index)
                        const projectLabel = p.projectNumber
                          ? `${p.projectNumber}${p.productNo ? ` — ${p.productNo}` : ""}`
                          : (p.productNo ?? "Unknown project")

                        return (
                          <CommandItem
                            key={projectKey}
                            value={projectKey}
                            onSelect={(val) => {
                              setProjectNumber(val)
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                projectNumber === projectKey
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {projectLabel}
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Column 3: Action Button */}
          <Button
            onClick={handleFetchDetails}
            disabled={!projectNumber || isFetchingDetails}
            className="w-full gap-2"
          >
            {isFetchingDetails ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <Search className="h-4 w-4 shrink-0" />
            )}
            <span className="hidden xl:inline">Search</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
