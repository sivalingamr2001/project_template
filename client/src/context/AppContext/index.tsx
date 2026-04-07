import { createContext, useContext, type ReactNode } from "react"
import type { AppContextType } from "./types"
export * from "./types"
import { useAppContextLogic } from "./useAppContextLogic"

export const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const { isLoading, ...contextValue } = useAppContextLogic()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    )
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}
