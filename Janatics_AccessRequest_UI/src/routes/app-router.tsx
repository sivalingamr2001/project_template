import { Routes, Route } from "react-router-dom"

import Dashboard from "../pages/Dashboard"
import LoginPage from "../pages/LoginPage"
import ProtectedRoute from "./ProtectedRoute"
import AuthLayout from "@/layout/layout/AuthLayout"
import AppLayout from "@/layout/layout/AppLayout"
import ProjectSearch from "@/pages/ProjectSearch"

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
      </Route>
    </Routes>
  )
}
