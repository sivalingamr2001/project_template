import { createContext, useContext, useMemo } from "react"
import type { ThemeProviderProps, ThemeProviderState } from "./types"
import { useThemeLogic } from "./useThemeLogic"

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  disableTransitionOnChange = true,
}: ThemeProviderProps) {
  const { theme, setTheme } = useThemeLogic({
    defaultTheme,
    storageKey,
    disableTransitionOnChange,
  })

  const value = useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme, setTheme]
  )

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
