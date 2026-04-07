import type { ReactNode } from "react"

export type Theme = "dark" | "light" | "system"
export type ResolvedTheme = "dark" | "light"

export interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
  disableTransitionOnChange?: boolean
}

export interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
}
