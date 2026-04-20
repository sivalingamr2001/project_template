import { Navigate, createBrowserRouter } from "react-router-dom"
import { PrivateLayout } from "@/layout/PrivateLayout"
import { RequireAuth } from "@/features/auth/components/RequireAuth"
import LoginPage from "@/features/auth/pages/LoginPage"
import Analytics from "@/features/budget/pages/Analytics"
import Dashboard from "@/features/budget/pages/Dashboard"
import PlanEntry from "@/features/budget/pages/PlanEntry"

export const appRouter = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <PrivateLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/budget/dashboard" replace />,
      },
      {
        path: "budget/dashboard",
        element: <Dashboard />,
      },
      {
        path: "budget/plan-entry",
        element: <PlanEntry />,
      },
      {
        path: "budget/analytics",
        element: <Analytics />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/budget/dashboard" replace />,
  },
])
