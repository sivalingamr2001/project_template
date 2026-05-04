import { useEffect, useState } from "react"
import {
  getActualAmounts,
  type ActualAmountItem,
  type ActualAmountsResponse,
} from "../../types"

interface UseActualAmountsResult {
  actualAmounts: ActualAmountItem[] | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useActualAmounts(
  projectNumber: string,
  productNo: string
): UseActualAmountsResult {
  const [actualAmounts, setActualAmounts] = useState<ActualAmountItem[] | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActualAmounts = async () => {
    try {
      setLoading(true)
      setError(null)

      const response: ActualAmountsResponse = await getActualAmounts(
        projectNumber,
        productNo
      )

      if (response && response.items) {
        setActualAmounts(response.items)
      } else {
        setActualAmounts([])
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch actual amounts"
      setError(errorMessage)
      console.error("Error fetching actual amounts:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (projectNumber && productNo) {
      fetchActualAmounts()
    }
  }, [projectNumber, productNo])

  return {
    actualAmounts,
    loading,
    error,
    refetch: fetchActualAmounts,
  }
}
