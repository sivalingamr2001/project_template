import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { AppProvider } from "@/providers/app-provider.tsx"
import { AuthProvider } from "@/providers/auth-provider.tsx"
import { ThemeProvider } from "@/providers/theme-provider.tsx"
import { TooltipProvider } from "./shared/components/ui/tooltip.tsx"
import BudgetProvider from "@/providers/Budget/BudgetProvider.tsx"
import { NavigationBlockProvider } from "@/providers/NavigationBlockProvider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <AuthProvider>
        <ThemeProvider>
          <NavigationBlockProvider>
            <BudgetProvider>
              <TooltipProvider>
                <App />
              </TooltipProvider>
            </BudgetProvider>
          </NavigationBlockProvider>
        </ThemeProvider>
      </AuthProvider>
    </AppProvider>
  </StrictMode>
)
