import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AuthProvider } from "@/features/auth";
import "@/styles.css";
import App from "./App";
import { ThemeProvider } from "./shared/components/ThemeProvider";
import { Toaster } from "./shared/components/ui/sonner";
import { TooltipProvider } from "./shared/components/ui/tooltip";
import { LoaderProvider } from "./shared/hooks/useLoader";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <LoaderProvider>
        <TooltipProvider>
          <AuthProvider>
            <Toaster position="top-right" richColors />
            <App />
          </AuthProvider>
        </TooltipProvider>
      </LoaderProvider>
    </ThemeProvider>
  </StrictMode>,
);
