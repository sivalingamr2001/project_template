import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AuthProvider } from "@/features/auth";
import "@/styles.css";
import App from "./App";
import { ThemeProvider } from "./shared/components/ThemeProvider";
import { Toaster } from "./shared/components/ui/sonner";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
