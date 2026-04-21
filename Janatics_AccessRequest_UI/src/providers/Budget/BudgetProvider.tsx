import { useContext, useState, useCallback, useRef } from "react"
import type { ReactNode } from "react"
import { BudgetContext, type BudgetContextType } from "./BudgetContext"
import type {
  BudgetRecord,
  BudgetRecordResponse,
} from "@/features/budget/types"
import { apiService, type ApiError } from "@/shared/lib/api-client"
import { mapBudgetApiToUi } from "@/features/budget/types"
import { toast } from "sonner"

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

  const lastToastTime = useRef(0)

  const handleNotFound = useCallback((message: string) => {
    const now = Date.now()
    if (now - lastToastTime.current > 500) {
      setError(null)
      toast(message)
      lastToastTime.current = now
    }
  }, [])

  const fetchBudgetRecords = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response =
        await apiService.get<BudgetRecordResponse[]>("/api/budgets")
      setBudgetRecords(response.data.map(mapBudgetApiToUi))
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
          `/api/budgets/${id}`
        )
        setActiveRecord(mapBudgetApiToUi(response.data))
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
      try {
        const response = await apiService.get<BudgetRecordResponse>(
          `/budgets/by-project/${projectNumber}/product/${productNumber}`
        )
        setBudgetRecords((prev) => {
          const existingIndex = prev.findIndex(
            (record) =>
              record.projectHeader.projectCode === projectNumber &&
              record.projectHeader.productNo === productNumber
          )
          const newRecord = mapBudgetApiToUi(response.data)
          if (existingIndex >= 0) {
            const updatedRecords = [...prev]
            updatedRecords[existingIndex] = newRecord
            return updatedRecords
          }
          return [...prev, newRecord]
        })

        setActiveRecord(mapBudgetApiToUi(response.data))
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

  const createBudgetRecord = useCallback(
    async (record: Omit<BudgetRecord, "id">) => {
      setLoading(true)
      setError(null)
      try {
        const request = {
          employeeId: record.projectHeader.employeeId,
          projectCode: record.projectHeader.projectCode,
          productNo: record.projectHeader.productNo,
          projectTitle: record.projectHeader.productName,
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
          "/api/budgets",
          request
        )

        if (response.status !== 200 && response.status !== 201) {
          throw new Error(`Unexpected response status: ${response.status}`)
        }

        const newRecord = mapBudgetApiToUi(response.data)
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
    async (id: string, updates: Partial<BudgetRecord>) => {
      setLoading(true)
      setError(null)
      try {
        const numericId = Number(id)
        if (!Number.isInteger(numericId) || numericId <= 0) {
          throw new Error("Invalid budget record id for update.")
        }

        const request = {
          projectCode: updates.projectHeader?.projectCode ?? "",
          productNo: updates.projectHeader?.productNo ?? "",
          projectTitle: updates.projectHeader?.productName ?? "",
          items: updates.budgetData
            ? updates.budgetData.flatMap((category) =>
                category.items
                  .filter((item) => item.itemId != null)
                  .map((item) => ({
                    itemId: item.itemId as number,
                    planned: item.planned,
                    actual: item.actual,
                  }))
              )
            : undefined,
        }

        const response = await apiService.put<BudgetRecordResponse>(
          `/api/budgets/${numericId}`,
          request
        )

        if (response.status !== 200 && response.status !== 201) {
          throw new Error(`Unexpected response status: ${response.status}`)
        }

        const updatedRecord = mapBudgetApiToUi(response.data)
        setBudgetRecords((prev) =>
          prev.map((record) => (record.id === id ? updatedRecord : record))
        )
        if (activeRecord?.id === id) {
          setActiveRecord(updatedRecord)
        }
        return updatedRecord
      } catch (err: unknown) {
        if (isApiError(err) && err.statusCode === 404) {
          setActiveRecord((current) => (current?.id === id ? null : current))
          setBudgetRecords((prev) => prev.filter((record) => record.id !== id))
          handleNotFound("Budget record not found.")
        } else {
          setError(
            isApiError(err) ? err.message : "Failed to update budget record"
          )
        }
        throw err
      } finally {
        setLoading(false)
      }
    },
    [activeRecord, handleNotFound]
  )

  const deleteBudgetRecord = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)
      try {
        await apiService.delete(`/api/budgets/${id}`)
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
