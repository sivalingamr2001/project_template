import { Routes, Route, useNavigate } from "react-router-dom"

import Dashboard from "../pages/Dashboard"
import LoginPage from "../pages/LoginPage"
import ProtectedRoute from "./ProtectedRoute"
import AuthLayout from "@/layout/layout/AuthLayout"
import AppLayout from "@/layout/layout/AppLayout"
import ProjectSearch from "@/pages/ProjectSearch"
import PlanEntry from "@/pages/PlanEntry"
import ReportPage from "@/pages/ReportPage"
import BudgetTemplate from "@/pages/BudgetTemplate"
import TemplateEditorPage from "@/pages/TemplateEditorPage"
import { useEffect } from "react"
import ApprovedProjects from "@/shared/components/ProjectSearch/ApprovedProjects"
import PendingProjects from "@/shared/components/ProjectSearch/PendingProjects"

export default function AppRoutes() {
  const navigate = useNavigate()

  useEffect(() => {
    const user = localStorage.getItem("janatics-auth-user")
    if (!user) {
      navigate("/")
      return
    }
    try {
      JSON.parse(user)
      navigate("/dashboard")
    } catch {
      localStorage.removeItem("janatics-auth-user")
    }
  }, [])

  return (
    <Routes>
      {/* Public */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<LoginPage />} />
      </Route>

      {/* Protected */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectSearch />} />
        <Route path="/plan-entry" element={<PlanEntry />} />
        <Route path="/reports" element={<ReportPage />} />
        <Route path="/budget-template" element={<BudgetTemplate />} />
        <Route path="/projects/approved" element={<ApprovedProjects />} />
        <Route path="/projects/pending" element={<PendingProjects />} />
        <Route
          path="/budget-template/editor"
          element={<TemplateEditorPage />}
        />
        <Route
          path="/budget-template/editor/:templateId"
          element={<TemplateEditorPage />}
        />
      </Route>
    </Routes>
  )
}
