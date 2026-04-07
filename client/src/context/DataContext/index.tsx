import { createContext, useContext, type ReactNode } from "react"
import { useDataContextLogic } from "./useDataContextLogic"
import type { DataContextType } from "./types"

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const logic = useDataContextLogic()

  return (
    <DataContext.Provider value={logic}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within DataProvider")
  }
  return context
}
