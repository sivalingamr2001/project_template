import { useContext, useState, useCallback, useRef } from "react"
import type { ReactNode } from "react"
import { BudgetContext, type BudgetContextType } from "./BudgetContext"
import type {
  BudgetRecord,
  BudgetRecordResponse,
  UpdateBudgetRequest,
} from "@/features/budget/types"
import { apiService, type ApiError } from "@/shared/lib/api-client"
import { mapBudgetApiToUi, updateBudget } from "@/features/budget/types"
import { applyTemplateMetadataToBudgetData } from "@/features/budget/utils/budgetTemplates"
import {
  sumIncludedActual,
  sumIncludedPlanned,
} from "@/features/budget/components/plan-entry/utils/budgetTableUtils"
import { toast } from "sonner"
import { useAuth } from "../auth-provider"

interface BudgetProviderProps {
  children: ReactNode
}

function isApiError(error: unknown): error is ApiError {
  return typeof error === "object" && error !== null && "statusCode" in error
}

function BudgetProvider({ children }: BudgetProviderProps) {
  const [budgetRecords, setBudgetRecords] = useState<BudgetRecord[]>([])
  const [activeRecord, setActiveRecord] = useState<BudgetRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const lastToastTime = useRef(0)

  const mapBudgetResponseToUi = useCallback(
    (response: BudgetRecordResponse) => {
      const mapped = mapBudgetApiToUi(response)
      const budgetData = applyTemplateMetadataToBudgetData(
        mapped.budgetData,
        response.templateStructure
      )
      const totalPlanned = budgetData.reduce(
        (sum, category) => sum + sumIncludedPlanned(category.items),
        0
      )
      const totalActual = budgetData.reduce(
        (sum, category) => sum + sumIncludedActual(category.items),
        0
      )

      return {
        ...mapped,
        budgetData,
        projectHeader: {
          ...mapped.projectHeader,
          status: totalPlanned - totalActual < 0 ? "AT RISK" : "ON TRACK",
        },
      }
    },
    []
  )

  const handleNotFound = useCallback((message: string) => {
    const now = Date.now()
    if (now - lastToastTime.current > 500) {
      setError(null)
      toast(message)
      lastToastTime.current = now
    }
  }, [])

  const mapTableBudgetApiToUi = (data: any) => ({
    ...data,
    projectHeader: {
      projectNumber: data.projectHeader?.projectNumber ?? data.projectNumber,
      productNo: data.projectHeader?.productNo ?? data.productNo,
      productName: data.projectHeader?.productName ?? data.projectTitle,
      status: data.projectHeader?.status ?? data.status ?? "N/A",
      approvalStatus: data.projectHeader?.approvalStatus ?? data.approvalStatus,
      isActive: data.projectHeader?.isActive ?? data.isActive,
    },
  })

  const fetchBudgetRecords = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.get<BudgetRecordResponse[]>("/budgets")
      setBudgetRecords(response.data.map(mapTableBudgetApiToUi))
    } catch (err: unknown) {
      if (isApiError(err) && err.statusCode === 404) {
        setBudgetRecords([])
        handleNotFound("No budget records found.")
      } else {
        setError(
          isApiError(err) ? err.message : "Failed to fetch budget records"
        )
      }
    } finally {
      setLoading(false)
    }
  }, [handleNotFound])

  const fetchBudgetRecord = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiService.get<BudgetRecordResponse>(
          `/budgets/${id}`
        )
        setActiveRecord(mapBudgetResponseToUi(response.data))
      } catch (err: unknown) {
        if (isApiError(err) && err.statusCode === 404) {
          setActiveRecord(null)
          handleNotFound("Budget record not found.")
        } else {
          setError(
            isApiError(err) ? err.message : "Failed to fetch budget record"
          )
        }
      } finally {
        setLoading(false)
      }
    },
    [handleNotFound]
  )

  const fetchBudgetRecordById = useCallback(
    async (projectNumber: string, productNumber: string) => {
      setLoading(true)
      setError(null)

      setActiveRecord(null)
      setBudgetRecords([])

      try {
        const response = await apiService.get<BudgetRecordResponse>(
          `/budgets/by-project/${projectNumber}/product/${productNumber}`
        )
        const mappedData = mapBudgetResponseToUi(response.data)

        setBudgetRecords([mappedData])
        setActiveRecord(mappedData)
      } catch (err: unknown) {
        if (isApiError(err) && err.statusCode === 404) {
          handleNotFound("Budget record not found.")
        } else {
          setError(
            isApiError(err) ? err.message : "Failed to fetch budget record"
          )
        }
      } finally {
        setLoading(false)
      }
    },
    [handleNotFound]
  )

  const createBudgetRecord = useCallback(
    async (record: Omit<BudgetRecord, "id"> & { templateId?: number }) => {
      setLoading(true)
      setError(null)
      try {
        const request = {
          employeeId: record.projectHeader.employeeId,
          projectNumber: record.projectHeader.projectNumber,
          productNo: record.projectHeader.productNo,
          productName: record.projectHeader.productName,
          templateId: record.templateId,
          budgetData: record.budgetData.map((category) => ({
            category: category.category,
            items: category.items.map((item) => ({
              name: item.name,
              planned: item.planned,
              actual: item.actual,
            })),
          })),
        }

        const response = await apiService.post<BudgetRecordResponse>(
          "/budgets",
          request
        )

        if (response.status !== 200 && response.status !== 201) {
          throw new Error(`Unexpected response status: ${response.status}`)
        }

        const newRecord = mapBudgetResponseToUi(response.data)
        setBudgetRecords((prev) => [...prev, newRecord])
        setActiveRecord(newRecord)
        return newRecord
      } catch (err: unknown) {
        if (isApiError(err) && err.statusCode === 404) {
          handleNotFound("Budget record endpoint not found.")
        } else {
          setError(
            isApiError(err) ? err.message : "Failed to create budget record"
          )
        }
        throw err
      } finally {
        setLoading(false)
      }
    },
    [handleNotFound]
  )

  const updateBudgetRecord = useCallback(
    async (id: string, updates: Partial<BudgetRecord>): Promise<any> => {
      setLoading(true)
      setError(null)

      try {
        const numericId = Number(id)
        if (!Number.isInteger(numericId) || numericId <= 0) {
          throw new Error("Invalid budget record id.")
        }

        // 1. Get the current state (containing real DB IDs: 52, 13, 63, etc.)
        const currentRecord =
          budgetRecords.find((r) => r.id === id) ?? activeRecord

        if (!currentRecord) {
          throw new Error("Budget record not found in local state.")
        }

        // 2. Merge updates while strictly preserving IDs from the currentRecord
        const nextRecord: BudgetRecord = {
          ...currentRecord,
          ...updates,
          projectHeader: {
            ...currentRecord.projectHeader,
            ...updates.projectHeader,
          },
          // Fallback to currentRecord.budgetData to ensure IDs aren't lost
          budgetData: updates.budgetData ?? currentRecord.budgetData,
        }

        // 3. Construct the request object for the C# API
        const request: UpdateBudgetRequest = {
          budgetId: numericId,
          modifiedBy: user?.employeeId ?? 0,
          modifedOn: new Date().toISOString(),

          items: nextRecord.budgetData.flatMap((uiCategory) => {
            const realCategory = currentRecord.budgetData.find(
              (c) =>
                c.category === uiCategory.category ||
                c.categoryId === uiCategory.categoryId
            )

            return uiCategory.items.map((uiItem) => {
              const realItem = realCategory?.items.find(
                (i: any) => i.name === uiItem.name || i.itemId === uiItem.itemId
              )

              return {
                // Use "as number" to satisfy the type, or fallback to 0
                itemId: (realItem?.itemId ?? uiItem.itemId ?? 0) as number,
                categoryId: realCategory?.categoryId ?? uiCategory.categoryId,
                planned: uiItem.planned,
              }
            })
          }),
        }

        // 4. Execute API Call
        const response = await updateBudget(numericId, request)

        localStorage.removeItem(`failed_save_${id}`)

        if (response) {
          toast.success("Budget record updated successfully.")
        }
      } catch (err: unknown) {
        const message = isApiError(err)
          ? err.message
          : "Failed to update budget record"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [activeRecord, budgetRecords, user, mapBudgetResponseToUi]
  )

  const deleteBudgetRecord = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)
      try {
        await apiService.delete(`/budgets/${id}`)
        setBudgetRecords((prev) => prev.filter((record) => record.id !== id))
        if (activeRecord?.id === id) {
          setActiveRecord(null)
        }
      } catch (err: unknown) {
        if (isApiError(err) && err.statusCode === 404) {
          setBudgetRecords((prev) => prev.filter((record) => record.id !== id))
          if (activeRecord?.id === id) {
            setActiveRecord(null)
          }
          handleNotFound("Budget record not found.")
        } else {
          setError(
            isApiError(err) ? err.message : "Failed to delete budget record"
          )
        }
      } finally {
        setLoading(false)
      }
    },
    [activeRecord, handleNotFound]
  )

  const contextValue: BudgetContextType = {
    budgetRecords,
    activeRecord,
    loading,
    error,
    fetchBudgetRecords,
    fetchBudgetRecord,
    fetchBudgetRecordById,
    createBudgetRecord,
    updateBudgetRecord,
    deleteBudgetRecord,
    setActiveRecord,
  }

  return (
    <BudgetContext.Provider value={contextValue}>
      {children}
    </BudgetContext.Provider>
  )
}

export default BudgetProvider

export const useBudget = (): BudgetContextType => {
  const context = useContext(BudgetContext)
  if (context === undefined) {
    throw new Error("useBudget must be used within a BudgetProvider")
  }
  return context
}
