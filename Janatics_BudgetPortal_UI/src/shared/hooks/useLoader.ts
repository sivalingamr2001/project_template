import { useState, useCallback } from "react"

function useLoader() {
  const [loading, setIsLoading] = useState(false)

  const withLoader = useCallback(
    async <T>(asyncFunction: () => Promise<T>): Promise<T> => {
      setIsLoading(true)
      try {
        return await asyncFunction()
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { loading, withLoader }
}

export default useLoader
