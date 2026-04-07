import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "./context/ThemeProvider"
import { TooltipProvider } from "./components/ui/tooltip.tsx"
import { Toaster } from "./components/ui/sonner.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <TooltipProvider delayDuration={0}>
          <Toaster position="bottom-right" richColors />
          <App />
        </TooltipProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)
