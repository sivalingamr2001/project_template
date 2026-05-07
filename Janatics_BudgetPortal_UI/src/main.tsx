import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { AppProvider } from "@/providers/app-provider.tsx"
import { AuthProvider } from "@/providers/auth-provider.tsx"
import BudgetProvider from "@/providers/Budget/BudgetProvider.tsx"
import { NavigationBlockProvider } from "@/providers/NavigationBlockProvider.tsx"
import { ThemeProvider } from "@/providers/theme-provider.tsx"
import { BrowserRouter } from "react-router"
import App from "./App.tsx"
import "./index.css"
import { LoaderProvider } from "./providers/LoaderProvider.tsx.tsx"
import { Toaster } from "./shared/components/ui/sonner.tsx"
import { TooltipProvider } from "./shared/components/ui/tooltip.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename="/budget_portal">
      <LoaderProvider>
        <AppProvider>
          <Toaster position="top-right" richColors visibleToasts={3} expand={true} />
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
      </LoaderProvider>
    </BrowserRouter>
  </StrictMode>
)
