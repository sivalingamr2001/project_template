import * as React from "react"
import type { ChartConfig } from "./types"

interface ChartContextValue {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextValue | null>(null)

export function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error("useChart must be used within a <ChartContainer />")
  return context
}

export function ChartProvider({
  config,
  children,
}: {
  config: ChartConfig
  children: React.ReactNode
}) {
  return <ChartContext.Provider value={{ config }}>{children}</ChartContext.Provider>
}

