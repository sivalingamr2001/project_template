import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AuthProvider } from "@/features/auth";
import "@/styles.css";
import App from "./App";
import { ThemeProvider } from "./shared/components/ThemeProvider";
import { Toaster } from "./shared/components/ui/sonner";
import { BudgetProvider } from "./features/budget/budget-context";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BudgetProvider>
          <Toaster position="top-right" richColors />
          <App />
        </BudgetProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
