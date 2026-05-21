import { useEffect, useState } from "react"

import type { AccessRequestDetails } from "../../types"
import { fetchAccessRequestDetails } from "../../utils/requestApi"

export function useRequestDetails(
  accessReqId: number,
  viewerUserId: number
) {
  const [details, setDetails] = useState<AccessRequestDetails | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const fetchDetails = async () => {
    if (!accessReqId || !viewerUserId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const payload = await fetchAccessRequestDetails(
        accessReqId,
        viewerUserId
      )
      setDetails(payload)
      setErrorMessage("")
    } catch (error) {
      setErrorMessage((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchDetails()
  }, [accessReqId, viewerUserId])

  return { details, errorMessage, isLoading, refetch: fetchDetails, setDetails }
}
