import { useCallback, useState } from "react"
import { useAppLoaderContext } from "@/providers/app-provider"

type LoaderScope = "local" | "global"

export function useLoader() {
  const { globalLoading, startGlobalLoading, stopGlobalLoading } =
    useAppLoaderContext()
  const [pendingCount, setPendingCount] = useState(0)

  const withLoader = useCallback(
    async <T>(factory: () => Promise<T>, options?: { scope?: LoaderScope }) => {
      const scope = options?.scope ?? "local"
      setPendingCount((prev) => prev + 1)

      if (scope === "global") {
        startGlobalLoading()
      }

      try {
        return await factory()
      } finally {
        setPendingCount((prev) => Math.max(0, prev - 1))

        if (scope === "global") {
          stopGlobalLoading()
        }
      }
    },
    [startGlobalLoading, stopGlobalLoading]
  )

  return {
    loading: pendingCount > 0,
    globalLoading,
    withLoader,
  }
}
