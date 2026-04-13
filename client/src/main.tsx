import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AuthProvider } from "@/features/auth";
import "@/styles.css";
import App from "./App";
import { ThemeProvider } from "./shared/components/ThemeProvider";
import { Toaster } from "./shared/components/ui/sonner";
import { TooltipProvider } from "./shared/components/ui/tooltip";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <Toaster position="top-right" richColors />
          <App />
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
);
