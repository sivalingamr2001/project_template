import { Navigate, Route, Routes, BrowserRouter } from "react-router-dom";

import LoginPage from "@/features/auth/LoginPage";
import { BudgetPage } from "@/features/budget";
import { AppLayout } from "@/layouts";
import { GuestRoute } from "@/router/GuestRoute";
import { ProtectedRoute } from "@/router/ProtectedRoute";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/budget" replace />} />
          <Route path="/budget" element={<BudgetPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/budget" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

