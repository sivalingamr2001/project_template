import { Routes, Route } from "react-router-dom"
import ProtectedRoute from "./ProtectedRoute"
import AppLayout from "../layout/AppLayout"
import AuthLayout from "../layout/AuthLayout"

import Dashboard from "../pages/Dashboard"
import ReportPage from "../pages/ReportPage"
import PlanEntry from "../pages/PlanEntry"
import BudgetTemplate from "../pages/BudgetTemplate"
import ProjectSearch from "../pages/ProjectSearch"
import LoginPage from "../pages/LoginPage"

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectSearch />} />
        <Route path="/plan-entry" element={<PlanEntry />} />
        <Route path="/budget-template" element={<BudgetTemplate />} />
        <Route path="/reports" element={<ReportPage />} />
      </Route>
    </Routes>
  )
}
