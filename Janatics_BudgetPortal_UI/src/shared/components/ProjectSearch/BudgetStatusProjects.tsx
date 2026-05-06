import { getBudgetById, mapBudgetApiToUi } from "@/features/budget/types"
import { applyTemplateMetadataToBudgetData } from "@/features/budget/utils/budgetTemplates"
import DataGrid from "@/features/DynamicGrid/components/DataGrid/DataGrid"
import { apiService } from "@/shared/lib/api-client"
import type { ProjectData } from "@/types"
import { CircleCheckBig, CircleOff, Eye } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { useAuth } from "@/providers/auth-provider"

interface BudgetSummaryItem {
  budgetId: number
  projectNumber: string
  productNo: string
  projectName: string
  status: string
  isActive?: boolean
  planned?: number
  actual?: number
  variance?: number
  usagePercentage?: number
}

function mapBudgetToProjectData(item: BudgetSummaryItem): ProjectData {
  return {
    budgetId: item.budgetId,
    product_no: item.productNo,
    projectnumber: item.projectNumber,
    projectname: item.projectName,
    status: item.status,
    isActive: item.isActive,
    planned: item.planned,
    actual: item.actual,
    variance: item.variance,
    usagePercentage: item.usagePercentage,
  }
}

interface BudgetStatusProjectsProps {
  title: string
  statusFilter: "Approved" | "Pending"
}

export default function BudgetStatusProjects({
  title,
  statusFilter,
}: BudgetStatusProjectsProps) {
  const [budgets, setBudgets] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const loadBudgets = async () => {
      setLoading(true)
      try {
        const response = await apiService.get<BudgetSummaryItem[]>("/budgets")
        const rows = response.data
          .map(mapBudgetToProjectData)
          .filter(
            (item) =>
              item.status?.toLowerCase() ===
              statusFilter.toLowerCase()
          )
        setBudgets(rows)
      } catch (error) {
        console.error("Failed to load budgets:", error)
        setBudgets([])
      } finally {
        setLoading(false)
      }
    }

    loadBudgets()
  }, [statusFilter])

  const handleViewDetails = useCallback(
    async (row: ProjectData) => {
      // If we don't have a budgetId from search results,
      // prompt user to create a new budget instead
      if (!row.budgetId) {
        toast.info(
          "No budget record found. Please create a new budget for this project."
        )

        return
      }

      try {
        const response = await getBudgetById(row.budgetId)
        const mappedRecord = mapBudgetApiToUi(response)
        navigate("/plan-entry", {
          state: {
            record: {
              ...mappedRecord,
              budgetData: applyTemplateMetadataToBudgetData(
                mappedRecord.budgetData,
                response.templateStructure
              ),
            },
          },
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

  const handleViewReport = useCallback(
    (row: ProjectData) => {
      if (!row.budgetId && !row.product_no) {
        toast.info("No report data found for this budget record.")
        return
      }

      navigate("/reports", {
        state: {
          budgetId: row.budgetId,
          productNo: row.product_no,
        },
      })
    },
    [navigate]
  )

  const handleDeleteBudget =
    async (budgetId: number) => {
      try {
        await apiService.delete(`/budgets/${budgetId}`)
        toast.success("Budget record deleted successfully.")
        setBudgets((prev) => prev.filter((b) => b.budgetId !== budgetId))
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to delete budget record."
        toast.error(errorMessage)
      }
    }

  const handleActivate = async (budgetId: number) => {
    setLoading(true);

    try {
      const res = await apiService.patch("/budgets", {
        budgetId: budgetId,
        IsActive: true
      });

      if (res.status === 200) {
        toast.success("Selected budget(s) activated successfully.");
        navigate("/projects/pending")
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to activate selected budget(s).";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const columnDefs = useMemo(
    () => [
      {
        field: "product_no",
        headerName: "Product No.",
        flex: 1
      },
      {
        field: "projectname",
        headerName: "Product Name",
        flex: 2,
        cellRenderer: (params: any) => (
          <Button
            type="button"
            onClick={() => handleViewDetails(params.data)}
            className="p-0 h-auto font-normal"
            variant="link"
          >
            {params.value}
          </Button>
        ),
      },
      { field: "projectnumber", headerName: "Project ID", flex: 1 },
      {
        field: "year", headerName: "Year", flex: 1, valueGetter: (params: any) => {
          if (!params.data.createdOn) return "";
          const date = new Date(params.data.createdOn);
          return date.getFullYear();
        },
      },
      { field: "team_name", headerName: "Team Name", flex: 1.5 },
      {
        field: "planned",
        headerName: "Planned",
        flex: 1,
        valueFormatter: (params: any) => params.value !== undefined ? `$${params.value?.toLocaleString()}` : "-"
      },
      {
        field: "actual",
        headerName: "Actual",
        flex: 1,
        valueFormatter: (params: any) => params.value !== undefined ? `$${params.value?.toLocaleString()}` : "-"
      },
      {
        field: "variance",
        headerName: "Variance",
        flex: 1,
        valueFormatter: (params: any) => params.value !== undefined ? `$${params.value?.toLocaleString()}` : "-"
      },
      {
        field: "usagePercentage",
        headerName: "Usage %",
        flex: 1,
        valueFormatter: (params: any) => params.value !== undefined && params.value !== null ? `${params.value.toFixed(2)}%` : "-"
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        cellRenderer: (params: any) => {
          const status = params.value?.toLowerCase();
          const statusStyles: Record<string, string> = {
            approved: "bg-green-100 text-green-800 border-green-200",
            rejected: "bg-red-100 text-red-800 border-red-200",
            pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
          };
          const currentStyle = statusStyles[status] || "bg-gray-100 text-gray-800";

          return (
            <div>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${currentStyle}`}>
                {params.value || "Unknown"}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Actions",
        pinned: "right" as const,
        cellRenderer: (params: any) => (
          <div className="flex justify-center items-center mt-4 gap-2">
            <Button
              size="sm"
              onClick={() => handleViewReport(params.data)}
              variant="outline"
            >
              <Eye className="mr-2 h-4 w-4" />              View
            </Button>
            {params.data?.isActive === true ?
              <Button
                className="text-danger"
                size="sm"
                onClick={() => handleDeleteBudget(params.data.budgetId)}
                variant="destructive"
              >
                <CircleOff className="text-red-600" /> De-Activate
              </Button>
              :
              <Button
                size="sm"
                onClick={() => handleActivate(params.data.budgetId)}
                variant="outline"
              >
                <CircleCheckBig className="text-green-600" />
              </Button>
            }
          </div>
        ),
      },
    ],
    [handleViewDetails, handleViewReport, statusFilter, user?.role]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-sm border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">
              Showing budgets filtered by {statusFilter.toLowerCase()} status.
            </p>
          </div>
        </div>
      </div>

      <DataGrid
        rowData={budgets}
        columnDefs={columnDefs}
        rowSelection="none"
        loading={loading}
        title={title}
        showSearch={true}
        showRefreshButton={true}
        showClearFiltersButton={false}
        showExportCsvButton={false}
        gridHeight="520px"
        onRefresh={async () => {
          setLoading(true)
          try {
            const response = await apiService.get<BudgetSummaryItem[]>("/budgets")
            const rows = response.data
              .map(mapBudgetToProjectData)
              .filter(
                (item) =>
                  item.status?.toLowerCase() ===
                  statusFilter.toLowerCase()
              )
            setBudgets(rows)
          } catch (error) {
            console.error("Failed to refresh budgets:", error)
            setBudgets([])
          } finally {
            setLoading(false)
          }
        }}
      />
    </div>
  )
}
