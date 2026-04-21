import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react"

type LoaderContextValue = {
  globalLoading: boolean
  startGlobalLoading: () => void
  stopGlobalLoading: () => void
}

const LoaderContext = createContext<LoaderContextValue | null>(null)

function GlobalLoaderOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="relative flex items-center justify-center">
        <span className="absolute h-16 w-16 animate-ping rounded-full bg-primary/20" />

        <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    </div>
  )
}

export function AppProvider({ children }: PropsWithChildren) {
  const [pendingCount, setPendingCount] = useState(0)

  const startGlobalLoading = useCallback(() => {
    setPendingCount((prev) => prev + 1)
  }, [])

  const stopGlobalLoading = useCallback(() => {
    setPendingCount((prev) => Math.max(0, prev - 1))
  }, [])

  const value = useMemo(
    () => ({
      globalLoading: pendingCount > 0,
      startGlobalLoading,
      stopGlobalLoading,
    }),
    [pendingCount, startGlobalLoading, stopGlobalLoading]
  )

  return (
    <LoaderContext.Provider value={value}>
      {children}
      {value.globalLoading ? <GlobalLoaderOverlay /> : null}
    </LoaderContext.Provider>
  )
}

export function useAppLoaderContext() {
  const context = useContext(LoaderContext)

  if (!context) {
    throw new Error("useAppLoaderContext must be used within AppProvider")
  }

  return context
}
